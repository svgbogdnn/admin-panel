from datetime import date
from typing import Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import String, case, cast, func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.course import Course
from app.models.feedback import Feedback
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsCourseOption,
    AnalyticsCourseSummaryRow,
    AnalyticsOverview,
    AnalyticsRatingBucket,
    AnalyticsRiskResponse,
    AnalyticsRiskRow,
    AnalyticsSummary,
    AnalyticsTimeseriesPoint,
    AnalyticsTopAbsentStudent,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _safe_role(current_user: User, db: Session) -> str:
    try:
        from app.core.security import get_role

        try:
            role = get_role(current_user, db)
        except TypeError:
            role = get_role(current_user)
        role = (role or "").lower().strip()
    except Exception:
        role = ""

    if hasattr(current_user, "role") and getattr(current_user, "role"):
        r2 = str(getattr(current_user, "role") or "").lower().strip()
        if r2 in {"admin", "teacher", "student"}:
            return r2

    if role in {"admin", "teacher", "student"}:
        return role

    if getattr(current_user, "is_superuser", False):
        return "admin"

    return "student"


def _attended_case() -> case:
    return case((cast(Attendance.status, String) == "absent", 0), else_=1)


def _absent_case() -> case:
    return case((cast(Attendance.status, String) == "absent", 1), else_=0)


def _apply_scope_filters(
    role: str,
    current_user: User,
    course_id: Optional[int],
    from_date: Optional[date],
    to_date: Optional[date],
    db: Session,
) -> Tuple[List[AnalyticsCourseOption], List[int]]:
    q = db.query(Course.id, Course.name).order_by(Course.name.asc())
    if role == "teacher":
        q = q.filter(Course.teacher_id == current_user.id)
    rows = q.all()
    allowed_ids = [r[0] for r in rows]

    if course_id is not None and role == "teacher" and course_id not in allowed_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к курсу")

    return [AnalyticsCourseOption(id=r[0], name=r[1]) for r in rows], allowed_ids


@router.get("/overview", response_model=AnalyticsOverview)
def analytics_overview(
    course_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    scope: str = "auto",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsOverview:
    role = _safe_role(current_user, db)

    requested_scope = (scope or "auto").lower().strip()
    if requested_scope not in {"auto", "overall", "personal"}:
        requested_scope = "auto"

    effective_scope = requested_scope
    if effective_scope == "auto":
        effective_scope = "overall" if role in {"admin", "teacher"} else "personal"
    if role == "student" and effective_scope == "overall":
        effective_scope = "personal"

    courses_for_filter, _ = _apply_scope_filters(role, current_user, course_id, from_date, to_date, db)

    lessons_q = db.query(Lesson.id).join(Course, Lesson.course_id == Course.id)
    if role == "teacher":
        lessons_q = lessons_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        lessons_q = lessons_q.filter(Lesson.course_id == course_id)
    if from_date is not None:
        lessons_q = lessons_q.filter(Lesson.date >= from_date)
    if to_date is not None:
        lessons_q = lessons_q.filter(Lesson.date <= to_date)
    lessons_count = lessons_q.count()

    att_base = (
        db.query(
            func.count(Attendance.id).label("total"),
            func.coalesce(func.sum(_attended_case()), 0).label("attended"),
        )
        .join(Lesson, Attendance.lesson_id == Lesson.id)
        .join(Course, Lesson.course_id == Course.id)
    )
    if role == "teacher":
        att_base = att_base.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        att_base = att_base.filter(Lesson.course_id == course_id)
    if from_date is not None:
        att_base = att_base.filter(Lesson.date >= from_date)
    if to_date is not None:
        att_base = att_base.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        att_base = att_base.filter(Attendance.student_id == current_user.id)

    att_row = att_base.one()
    attendance_total = int(att_row.total or 0)
    attendance_attended = int(att_row.attended or 0)
    attendance_rate = (attendance_attended / attendance_total) if attendance_total > 0 else 0.0

    ts_q = (
        db.query(
            Lesson.date.label("d"),
            func.count(Attendance.id).label("total"),
            func.coalesce(func.sum(_attended_case()), 0).label("attended"),
        )
        .join(Lesson, Attendance.lesson_id == Lesson.id)
        .join(Course, Lesson.course_id == Course.id)
    )
    if role == "teacher":
        ts_q = ts_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        ts_q = ts_q.filter(Lesson.course_id == course_id)
    if from_date is not None:
        ts_q = ts_q.filter(Lesson.date >= from_date)
    if to_date is not None:
        ts_q = ts_q.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        ts_q = ts_q.filter(Attendance.student_id == current_user.id)
    ts_q = ts_q.group_by(Lesson.date).order_by(Lesson.date.asc())

    timeseries: List[AnalyticsTimeseriesPoint] = []
    for r in ts_q.all():
        total = int(r.total or 0)
        attended = int(r.attended or 0)
        rate = (attended / total) if total > 0 else 0.0
        timeseries.append(
            AnalyticsTimeseriesPoint(
                date=r.d.isoformat() if r.d else "",
                total=total,
                attended=attended,
                attendance_rate=rate,
            )
        )

    fb_base = (
        db.query(
            func.count(Feedback.id).label("cnt"),
            func.avg(Feedback.rating).label("avg"),
        )
        .join(Lesson, Feedback.lesson_id == Lesson.id)
        .join(Course, Lesson.course_id == Course.id)
        .filter(Feedback.is_hidden.is_(False))
    )
    if role == "teacher":
        fb_base = fb_base.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        fb_base = fb_base.filter(Lesson.course_id == course_id)
    if from_date is not None:
        fb_base = fb_base.filter(Lesson.date >= from_date)
    if to_date is not None:
        fb_base = fb_base.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        fb_base = fb_base.filter(Feedback.student_id == current_user.id)

    fb_row = fb_base.one()
    feedback_count = int(fb_row.cnt or 0)
    feedback_avg = float(fb_row.avg) if fb_row.avg is not None else None

    dist_q = (
        db.query(
            func.round(Feedback.rating).label("r"),
            func.count(Feedback.id).label("c"),
        )
        .join(Lesson, Feedback.lesson_id == Lesson.id)
        .join(Course, Lesson.course_id == Course.id)
        .filter(Feedback.is_hidden.is_(False))
    )
    if role == "teacher":
        dist_q = dist_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        dist_q = dist_q.filter(Lesson.course_id == course_id)
    if from_date is not None:
        dist_q = dist_q.filter(Lesson.date >= from_date)
    if to_date is not None:
        dist_q = dist_q.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        dist_q = dist_q.filter(Feedback.student_id == current_user.id)
    dist_q = dist_q.group_by(func.round(Feedback.rating))

    buckets: Dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in dist_q.all():
        try:
            k = int(r.r)
        except Exception:
            continue
        if k < 1:
            k = 1
        if k > 5:
            k = 5
        buckets[k] = buckets.get(k, 0) + int(r.c or 0)

    rating_distribution = [AnalyticsRatingBucket(rating=k, count=buckets[k]) for k in [1, 2, 3, 4, 5]]

    top_absent_students: List[AnalyticsTopAbsentStudent] = []
    if role in {"admin", "teacher"} and effective_scope == "overall":
        top_q = (
            db.query(
                User.id.label("sid"),
                User.full_name.label("name"),
                func.coalesce(func.sum(_absent_case()), 0).label("absent"),
                func.count(Attendance.id).label("total"),
            )
            .join(Attendance, Attendance.student_id == User.id)
            .join(Lesson, Attendance.lesson_id == Lesson.id)
            .join(Course, Lesson.course_id == Course.id)
        )
        if role == "teacher":
            top_q = top_q.filter(Course.teacher_id == current_user.id)
        if course_id is not None:
            top_q = top_q.filter(Lesson.course_id == course_id)
        if from_date is not None:
            top_q = top_q.filter(Lesson.date >= from_date)
        if to_date is not None:
            top_q = top_q.filter(Lesson.date <= to_date)

        top_q = top_q.group_by(User.id, User.full_name).order_by(
            func.coalesce(func.sum(_absent_case()), 0).desc()
        ).limit(10)

        for r in top_q.all():
            total = int(r.total or 0)
            absent = int(r.absent or 0)
            rate = (absent / total) if total > 0 else 0.0
            top_absent_students.append(
                AnalyticsTopAbsentStudent(
                    student_id=int(r.sid),
                    student_name=str(r.name or f"ID {int(r.sid)}"),
                    absent=absent,
                    total=total,
                    absent_rate=rate,
                )
            )

    lesson_by_course_q = (
        db.query(
            Course.id.label("cid"),
            Course.name.label("cname"),
            func.count(Lesson.id).label("lessons"),
        )
        .outerjoin(Lesson, Lesson.course_id == Course.id)
    )
    if role == "teacher":
        lesson_by_course_q = lesson_by_course_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        lesson_by_course_q = lesson_by_course_q.filter(Course.id == course_id)
    if from_date is not None:
        lesson_by_course_q = lesson_by_course_q.filter((Lesson.date.is_(None)) | (Lesson.date >= from_date))
    if to_date is not None:
        lesson_by_course_q = lesson_by_course_q.filter((Lesson.date.is_(None)) | (Lesson.date <= to_date))
    lesson_by_course_q = lesson_by_course_q.group_by(Course.id, Course.name)

    lessons_map: Dict[int, Tuple[str, int]] = {}
    for r in lesson_by_course_q.all():
        lessons_map[int(r.cid)] = (str(r.cname), int(r.lessons or 0))

    att_by_course_q = (
        db.query(
            Course.id.label("cid"),
            func.count(Attendance.id).label("total"),
            func.coalesce(func.sum(_attended_case()), 0).label("attended"),
        )
        .join(Lesson, Lesson.course_id == Course.id)
        .join(Attendance, Attendance.lesson_id == Lesson.id)
    )
    if role == "teacher":
        att_by_course_q = att_by_course_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        att_by_course_q = att_by_course_q.filter(Course.id == course_id)
    if from_date is not None:
        att_by_course_q = att_by_course_q.filter(Lesson.date >= from_date)
    if to_date is not None:
        att_by_course_q = att_by_course_q.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        att_by_course_q = att_by_course_q.filter(Attendance.student_id == current_user.id)
    att_by_course_q = att_by_course_q.group_by(Course.id)

    att_map: Dict[int, Tuple[int, int]] = {}
    for r in att_by_course_q.all():
        att_map[int(r.cid)] = (int(r.total or 0), int(r.attended or 0))

    fb_by_course_q = (
        db.query(
            Course.id.label("cid"),
            func.count(Feedback.id).label("cnt"),
            func.avg(Feedback.rating).label("avg"),
        )
        .join(Lesson, Lesson.course_id == Course.id)
        .join(Feedback, Feedback.lesson_id == Lesson.id)
        .filter(Feedback.is_hidden.is_(False))
    )
    if role == "teacher":
        fb_by_course_q = fb_by_course_q.filter(Course.teacher_id == current_user.id)
    if course_id is not None:
        fb_by_course_q = fb_by_course_q.filter(Course.id == course_id)
    if from_date is not None:
        fb_by_course_q = fb_by_course_q.filter(Lesson.date >= from_date)
    if to_date is not None:
        fb_by_course_q = fb_by_course_q.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        fb_by_course_q = fb_by_course_q.filter(Feedback.student_id == current_user.id)
    fb_by_course_q = fb_by_course_q.group_by(Course.id)

    fb_map: Dict[int, Tuple[int, Optional[float]]] = {}
    for r in fb_by_course_q.all():
        fb_map[int(r.cid)] = (int(r.cnt or 0), float(r.avg) if r.avg is not None else None)

    course_summary: List[AnalyticsCourseSummaryRow] = []
    for cid, (cname, lcnt) in sorted(lessons_map.items(), key=lambda x: x[1][0].lower()):
        total, attended = att_map.get(cid, (0, 0))
        rate = (attended / total) if total > 0 else 0.0
        fcnt, favg = fb_map.get(cid, (0, None))
        course_summary.append(
            AnalyticsCourseSummaryRow(
                course_id=cid,
                course_name=cname,
                lessons=lcnt,
                attendance_rate=rate,
                feedback_avg=favg,
                feedback_count=fcnt,
            )
        )

    summary = AnalyticsSummary(
        courses=len(courses_for_filter) if role == "teacher" else (db.query(func.count(Course.id)).scalar() or 0),
        lessons=lessons_count,
        attendance_total=attendance_total,
        attendance_attended=attendance_attended,
        attendance_rate=float(attendance_rate),
        feedback_count=feedback_count,
        feedback_avg=feedback_avg,
    )

    return AnalyticsOverview(
        role=role,
        scope=effective_scope,
        courses=courses_for_filter
        if role == "teacher"
        else [AnalyticsCourseOption(id=r.id, name=r.name) for r in db.query(Course).order_by(Course.name.asc()).all()],
        summary=summary,
        timeseries=timeseries,
        rating_distribution=rating_distribution,
        top_absent_students=top_absent_students,
        course_summary=course_summary,
    )


def _streak_absent(statuses: List[str]) -> int:
    streak = 0
    for s in reversed(statuses):
        if (s or "").lower().strip() == "absent":
            streak += 1
        else:
            break
    return streak


def _make_features(window: List[str], history: List[str]) -> List[float]:
    w = [(x or "").lower().strip() for x in window if x is not None]
    h = [(x or "").lower().strip() for x in history if x is not None]
    wlen = len(w) if len(w) > 0 else 1
    hlen = len(h) if len(h) > 0 else 1

    abs_w = sum(1 for x in w if x == "absent")
    late_w = sum(1 for x in w if x == "late")
    exc_w = sum(1 for x in w if x == "excused")

    abs_h = sum(1 for x in h if x == "absent")
    late_h = sum(1 for x in h if x == "late")
    exc_h = sum(1 for x in h if x == "excused")

    return [
        abs_w / wlen,
        late_w / wlen,
        exc_w / wlen,
        float(_streak_absent(w)),
        abs_h / hlen,
        late_h / hlen,
        exc_h / hlen,
        float(len(history)),
        float(len(window)),
    ]


@router.get("/risk", response_model=AnalyticsRiskResponse)
def analytics_risk(
    course_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    scope: str = "auto",
    k: int = 5,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsRiskResponse:
    role = _safe_role(current_user, db)

    requested_scope = (scope or "auto").lower().strip()
    if requested_scope not in {"auto", "overall", "personal"}:
        requested_scope = "auto"

    effective_scope = requested_scope
    if effective_scope == "auto":
        effective_scope = "overall" if role in {"admin", "teacher"} else "personal"
    if role == "student":
        effective_scope = "personal"

    _, allowed_course_ids = _apply_scope_filters(role, current_user, course_id, from_date, to_date, db)

    effective_course_ids = allowed_course_ids
    if course_id is not None:
        effective_course_ids = [course_id] if course_id in allowed_course_ids else []

    if not effective_course_ids:
        return AnalyticsRiskResponse(
            role=role,
            scope=effective_scope,
            algorithm="logistic_regression",
            trained=False,
            training_samples=0,
            features=[],
            rows=[],
        )

    kk = max(2, min(int(k or 5), 20))
    lim = max(1, min(int(limit or 50), 500))

    q = (
        db.query(
            Attendance.student_id.label("sid"),
            Lesson.course_id.label("cid"),
            Lesson.date.label("d"),
            cast(Attendance.status, String).label("status"),
        )
        .join(Lesson, Attendance.lesson_id == Lesson.id)
        .filter(Lesson.course_id.in_(effective_course_ids))
    )
    if from_date is not None:
        q = q.filter(Lesson.date >= from_date)
    if to_date is not None:
        q = q.filter(Lesson.date <= to_date)
    if effective_scope == "personal":
        q = q.filter(Attendance.student_id == current_user.id)

    q = q.order_by(Attendance.student_id.asc(), Lesson.course_id.asc(), Lesson.date.asc())
    rows = q.all()

    series: Dict[Tuple[int, int], List[str]] = {}
    for r in rows:
        sid = int(r.sid)
        cid = int(r.cid)
        series.setdefault((sid, cid), []).append(str(r.status or "").lower().strip())

    student_ids = sorted({sid for sid, _ in series.keys()})
    course_ids = sorted({cid for _, cid in series.keys()})

    student_map: Dict[int, str] = (
        {int(r.id): str(r.full_name or f"ID {int(r.id)}") for r in db.query(User).filter(User.id.in_(student_ids)).all()}
        if student_ids
        else {}
    )
    course_map: Dict[int, str] = (
        {int(r.id): str(r.name or f"Курс {int(r.id)}") for r in db.query(Course).filter(Course.id.in_(course_ids)).all()}
        if course_ids
        else {}
    )

    X: List[List[float]] = []
    y: List[int] = []
    for _, statuses in series.items():
        if len(statuses) < kk + 1:
            continue
        for t in range(kk, len(statuses)):
            window = statuses[t - kk : t]
            history = statuses[:t]
            label = 1 if (statuses[t] == "absent") else 0
            X.append(_make_features(window, history))
            y.append(label)

    trained = False
    training_samples = len(y)
    features = [
        "recent_absent_rate",
        "recent_late_rate",
        "recent_excused_rate",
        "absent_streak",
        "overall_absent_rate",
        "overall_late_rate",
        "overall_excused_rate",
        "history_len",
        "window_len",
    ]

    model = None
    absent_class_index = None
    if training_samples >= 30 and len(set(y)) >= 2:
        try:
            from sklearn.linear_model import LogisticRegression
            from sklearn.pipeline import Pipeline
            from sklearn.preprocessing import StandardScaler

            model = Pipeline(
                steps=[
                    ("scaler", StandardScaler()),
                    ("lr", LogisticRegression(max_iter=2000, class_weight="balanced", solver="liblinear")),
                ]
            )
            model.fit(X, y)
            classes = list(model.named_steps["lr"].classes_)
            absent_class_index = classes.index(1) if 1 in classes else None
            trained = absent_class_index is not None
        except Exception:
            trained = False
            model = None
            absent_class_index = None

    out_rows: List[AnalyticsRiskRow] = []
    for (sid, cid), statuses in series.items():
        if not statuses:
            continue
        window = statuses[-kk:] if len(statuses) >= kk else statuses[:]
        history = statuses[:]
        feat = _make_features(window, history)

        recent_absent_rate = feat[0]
        absent_streak = int(feat[3])
        total_records = len(statuses)
        window_size = len(window)

        if trained and model is not None and absent_class_index is not None:
            try:
                proba = float(model.predict_proba([feat])[0][absent_class_index])
            except Exception:
                proba = (sum(1 for x in window if x == "absent") + 1) / (max(1, window_size) + 2)
        else:
            proba = (sum(1 for x in window if x == "absent") + 1) / (max(1, window_size) + 2)

        proba = min(0.995, max(0.005, proba))

        if trained:
            confidence = min(1.0, (training_samples / 200.0)) * min(1.0, (total_records / 20.0))
        else:
            confidence = min(0.4, total_records / 25.0)

        out_rows.append(
            AnalyticsRiskRow(
                student_id=sid,
                student_name=student_map.get(sid, f"ID {sid}"),
                course_id=cid,
                course_name=course_map.get(cid, f"Курс {cid}"),
                total_records=total_records,
                window_size=window_size,
                recent_absent_rate=float(recent_absent_rate),
                absent_streak=absent_streak,
                risk_absent_next=float(proba),
                model="logistic_regression" if trained else "heuristic",
                confidence=float(confidence),
            )
        )

    out_rows.sort(key=lambda r: (r.risk_absent_next, r.absent_streak, r.recent_absent_rate, r.total_records), reverse=True)
    out_rows = out_rows[:lim]

    return AnalyticsRiskResponse(
        role=role,
        scope=effective_scope,
        algorithm="logistic_regression",
        trained=trained,
        training_samples=training_samples if trained else 0,
        features=features,
        rows=out_rows,
    )
