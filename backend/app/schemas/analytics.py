from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsCourseOption(BaseModel):
    id: int
    name: str


class AnalyticsSummary(BaseModel):
    courses: int
    lessons: int
    attendance_total: int
    attendance_attended: int
    attendance_rate: float = Field(ge=0, le=1)
    feedback_count: int
    feedback_avg: Optional[float] = None


class AnalyticsTimeseriesPoint(BaseModel):
    date: str
    total: int
    attended: int
    attendance_rate: float = Field(ge=0, le=1)


class AnalyticsRatingBucket(BaseModel):
    rating: int = Field(ge=1, le=5)
    count: int = Field(ge=0)


class AnalyticsTopAbsentStudent(BaseModel):
    student_id: int
    student_name: str
    absent: int = Field(ge=0)
    total: int = Field(ge=0)
    absent_rate: float = Field(ge=0, le=1)


class AnalyticsCourseSummaryRow(BaseModel):
    course_id: int
    course_name: str
    lessons: int = Field(ge=0)
    attendance_rate: float = Field(ge=0, le=1)
    feedback_avg: Optional[float] = None
    feedback_count: int = Field(ge=0)


class AnalyticsOverview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    scope: str
    courses: List[AnalyticsCourseOption]
    summary: AnalyticsSummary
    timeseries: List[AnalyticsTimeseriesPoint]
    rating_distribution: List[AnalyticsRatingBucket]
    top_absent_students: List[AnalyticsTopAbsentStudent]
    course_summary: List[AnalyticsCourseSummaryRow]


class AnalyticsRiskRow(BaseModel):
    student_id: int
    student_name: str
    course_id: int
    course_name: str
    total_records: int = Field(ge=0)
    window_size: int = Field(ge=0)
    recent_absent_rate: float = Field(ge=0, le=1)
    absent_streak: int = Field(ge=0)
    risk_absent_next: float = Field(ge=0, le=1)
    model: str
    confidence: float = Field(ge=0, le=1)


class AnalyticsRiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    scope: str
    algorithm: str
    trained: bool
    training_samples: int = Field(ge=0)
    features: List[str]
    rows: List[AnalyticsRiskRow]
