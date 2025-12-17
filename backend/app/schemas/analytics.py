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
    rating: int
    count: int


class AnalyticsTopAbsentStudent(BaseModel):
    student_id: int
    student_name: str
    absent: int
    total: int
    absent_rate: float = Field(ge=0, le=1)


class AnalyticsCourseSummaryRow(BaseModel):
    course_id: int
    course_name: str
    lessons: int
    attendance_rate: float = Field(ge=0, le=1)
    feedback_avg: Optional[float] = None
    feedback_count: int


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
