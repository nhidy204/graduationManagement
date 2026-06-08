import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grade, GradeDocument, GradeType } from './schemas/grade.schema';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UserDocument } from '../users/schemas/user.schema';
import {
  SUPERVISOR_CRITERIA,
  REVIEWER_CRITERIA,
  FINAL_SCORE_WEIGHTS,
} from './constants/criteria.constants';

@Injectable()
export class GradingService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  // ── Tính điểm tổng có trọng số ──
  private calcTotal(
    criteria: { score: number | null; weight: number }[],
  ): number | null {
    const allFilled = criteria.every((c) => c.score !== null);
    if (!allFilled) return null;
    return criteria.reduce((acc, c) => acc + c.score! * c.weight, 0);
  }

  // ── Khởi tạo phiếu chấm điểm ──
  async initGrade(
    studentId: string,
    topicId: string,
    type: GradeType,
    graderId: string,
  ): Promise<GradeDocument> {
    const existing = await this.gradeModel.findOne({
      student: new Types.ObjectId(studentId),
      topic: new Types.ObjectId(topicId),
      type,
    });
    if (existing) return existing;

    const criteria =
      type === 'SUPERVISOR' ? SUPERVISOR_CRITERIA : REVIEWER_CRITERIA;

    const grade = new this.gradeModel({
      student: new Types.ObjectId(studentId),
      topic: new Types.ObjectId(topicId),
      grader: new Types.ObjectId(graderId),
      type,
      criteria,
      totalScore: null,
      submitted: false,
    });

    return grade.save();
  }

  // ── Cập nhật điểm từng tiêu chí ──
  async updateScore(
    gradeId: string,
    dto: UpdateScoreDto,
    user: UserDocument,
  ): Promise<GradeDocument> {
    const grade = await this.gradeModel.findById(gradeId);
    if (!grade) throw new NotFoundException('Không tìm thấy phiếu chấm');

    if (grade.submitted) {
      throw new BadRequestException(
        'Phiếu điểm đã được gửi, không thể chỉnh sửa',
      );
    }
    if (grade.grader.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa phiếu này');
    }

    const criteriaIndex = grade.criteria.findIndex(
      (c) => c.criteriaId === dto.criteriaId,
    );
    if (criteriaIndex === -1) {
      throw new NotFoundException('Không tìm thấy tiêu chí chấm điểm');
    }

    grade.criteria[criteriaIndex].score = dto.score;
    if (dto.generalComment !== undefined) {
      grade.generalComment = dto.generalComment;
    }

    grade.totalScore = this.calcTotal(grade.criteria);
    grade.markModified('criteria');
    await grade.save();

    const updated = await this.gradeModel
      .findById(gradeId)
      .populate('student', 'name email')
      .populate('topic', 'title major')
      .lean();

    if (!updated)
      throw new NotFoundException('Không tìm thấy phiếu chấm sau khi cập nhật');

    return {
      ...updated,
      _id: updated._id.toString(),
      grader: updated.grader?.toString?.() ?? String(updated.grader),
      student:
        updated.student && typeof updated.student === 'object'
          ? {
              ...(updated.student as object),
              _id: (updated.student as { _id: Types.ObjectId })._id?.toString(),
            }
          : updated.student,
      topic:
        updated.topic && typeof updated.topic === 'object'
          ? {
              ...(updated.topic as object),
              _id: (updated.topic as { _id: Types.ObjectId })._id?.toString(),
            }
          : updated.topic,
      criteria: updated.criteria.map((c) => ({ ...c, _id: c.criteriaId })),
    } as unknown as GradeDocument;
  }

  async submitGrade(
    gradeId: string,
    user: UserDocument,
  ): Promise<GradeDocument> {
    const grade = await this.gradeModel.findById(gradeId);
    if (!grade) throw new NotFoundException('Không tìm thấy phiếu chấm');

    if (grade.submitted) {
      throw new BadRequestException('Phiếu điểm đã được gửi rồi');
    }
    if (grade.grader.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền gửi phiếu này');
    }

    const allFilled = grade.criteria.every((c) => c.score !== null);
    if (!allFilled) {
      throw new BadRequestException(
        'Vui lòng nhập đủ điểm tất cả tiêu chí trước khi gửi',
      );
    }

    grade.submitted = true;
    grade.submittedAt = new Date();
    grade.totalScore = this.calcTotal(grade.criteria);
    await grade.save();

    const updated = await this.gradeModel
      .findById(gradeId)
      .populate('student', 'name email')
      .populate('topic', 'title major')
      .lean();

    if (!updated)
      throw new NotFoundException('Không tìm thấy phiếu chấm sau khi cập nhật');

    return {
      ...updated,
      _id: updated._id.toString(),
      grader: updated.grader?.toString?.() ?? String(updated.grader),
      student:
        updated.student && typeof updated.student === 'object'
          ? {
              ...(updated.student as object),
              _id: (updated.student as { _id: Types.ObjectId })._id?.toString(),
            }
          : updated.student,
      topic:
        updated.topic && typeof updated.topic === 'object'
          ? {
              ...(updated.topic as object),
              _id: (updated.topic as { _id: Types.ObjectId })._id?.toString(),
            }
          : updated.topic,
      criteria: updated.criteria.map((c) => ({ ...c, _id: c.criteriaId })),
    } as unknown as GradeDocument;
  }

  // ── Lấy danh sách phiếu chấm của giảng viên ──
  async findMyGrades(user: UserDocument) {
    const docs = await this.gradeModel
      .find({ grader: user._id })
      .populate('student', 'name email')
      .populate('topic', 'title major')
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      grader: doc.grader?.toString?.() ?? String(doc.grader),
      student:
        doc.student && typeof doc.student === 'object'
          ? {
              ...(doc.student as object),
              _id: (doc.student as { _id: Types.ObjectId })._id?.toString(),
            }
          : doc.student,
      topic:
        doc.topic && typeof doc.topic === 'object'
          ? {
              ...(doc.topic as object),
              _id: (doc.topic as { _id: Types.ObjectId })._id?.toString(),
            }
          : doc.topic,
      criteria: doc.criteria.map((c) => ({
        ...c,
        _id: c.criteriaId,
      })),
    }));
  }

  // ── Lấy kết quả tổng hợp của 1 student ──
  async getStudentResult(studentId: string) {
    const grades = await this.gradeModel
      .find({
        student: new Types.ObjectId(studentId),
        submitted: true,
      })
      .populate('topic', 'title major supervisor')
      .lean();

    const supervisorGrade = grades.find((g) => g.type === 'SUPERVISOR');
    const reviewerGrade = grades.find((g) => g.type === 'REVIEWER');

    const finalScore =
      supervisorGrade?.totalScore != null && reviewerGrade?.totalScore != null
        ? supervisorGrade.totalScore * FINAL_SCORE_WEIGHTS.supervisor +
          reviewerGrade.totalScore * FINAL_SCORE_WEIGHTS.reviewer
        : null;

    return {
      studentId,
      supervisorScore: supervisorGrade?.totalScore ?? null,
      reviewerScore: reviewerGrade?.totalScore ?? null,
      finalScore: finalScore ? parseFloat(finalScore.toFixed(2)) : null,
      supervisorCriteria: supervisorGrade?.criteria ?? [],
      reviewerCriteria: reviewerGrade?.criteria ?? [],
      supervisorComment: supervisorGrade?.generalComment ?? '',
      reviewerComment: reviewerGrade?.generalComment ?? '',
      published: supervisorGrade != null && reviewerGrade != null,
    };
  }

  // ── Admin lấy kết quả tất cả SV trong topic ──
  async getTopicResults(topicId: string) {
    const grades = await this.gradeModel
      .find({
        topic: new Types.ObjectId(topicId),
        submitted: true,
      })
      .populate('student', 'name email')
      .lean();

    // Group theo student
    const map: Map<
      string,
      { supervisor?: unknown; reviewer?: unknown; student: unknown }
    > = new Map();

    for (const g of grades) {
      const sid = g.student._id.toString();
      if (!map.has(sid)) {
        map.set(sid, { student: g.student });
      }
      if (g.type === 'SUPERVISOR') {
        map.get(sid)!.supervisor = g;
      }
      if (g.type === 'REVIEWER') {
        map.get(sid)!.reviewer = g;
      }
    }

    return Array.from(map.values()).map(({ student, supervisor, reviewer }) => {
      const getSupervisorScore = (): number | null => {
        if (
          typeof supervisor === 'object' &&
          supervisor !== null &&
          'totalScore' in supervisor
        ) {
          return (supervisor as Record<string, unknown>).totalScore as
            | number
            | null;
        }
        return null;
      };

      const getReviewerScore = (): number | null => {
        if (
          typeof reviewer === 'object' &&
          reviewer !== null &&
          'totalScore' in reviewer
        ) {
          return (reviewer as Record<string, unknown>).totalScore as
            | number
            | null;
        }
        return null;
      };

      const supervisorScore = getSupervisorScore();
      const reviewerScore = getReviewerScore();

      const finalScore =
        supervisorScore != null && reviewerScore != null
          ? supervisorScore * FINAL_SCORE_WEIGHTS.supervisor +
            reviewerScore * FINAL_SCORE_WEIGHTS.reviewer
          : null;

      return {
        student,
        supervisorScore,
        reviewerScore,
        finalScore: finalScore ? parseFloat(finalScore.toFixed(2)) : null,
        published: supervisor != null && reviewer != null,
      };
    });
  }

  // ── Assign reviewer (Admin) ──
  async assignReviewer(
    studentId: string,
    topicId: string,
    reviewerId: string,
  ): Promise<GradeDocument> {
    const existing = await this.gradeModel.findOne({
      student: new Types.ObjectId(studentId),
      topic: new Types.ObjectId(topicId),
      type: 'REVIEWER',
    });

    if (existing) {
      if (existing.submitted) {
        throw new BadRequestException(
          'Phiếu phản biện đã được gửi, không thể thay đổi',
        );
      }
      existing.grader = new Types.ObjectId(reviewerId);
      return existing.save();
    }

    return this.initGrade(studentId, topicId, 'REVIEWER', reviewerId);
  }
}
