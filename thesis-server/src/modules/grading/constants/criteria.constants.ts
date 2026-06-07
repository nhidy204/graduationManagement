export const SUPERVISOR_CRITERIA = [
  {
    criteriaId: 'sc1',
    name: 'Nội dung kỹ thuật',
    weight: 0.4,
    score: null,
    description: 'Độ sâu kỹ thuật, tính đúng đắn của giải pháp',
  },
  {
    criteriaId: 'sc2',
    name: 'Trình bày & văn phong',
    weight: 0.2,
    score: null,
    description: 'Chất lượng báo cáo, hình thức trình bày',
  },
  {
    criteriaId: 'sc3',
    name: 'Tiến độ thực hiện',
    weight: 0.2,
    score: null,
    description: 'Mức độ đúng hạn, chủ động trong quá trình làm',
  },
  {
    criteriaId: 'sc4',
    name: 'Demo / Sản phẩm',
    weight: 0.2,
    score: null,
    description: 'Chất lượng sản phẩm hoàn thiện, khả năng demo',
  },
];

export const REVIEWER_CRITERIA = [
  {
    criteriaId: 'rc1',
    name: 'Tính khoa học',
    weight: 0.35,
    score: null,
    description: 'Phương pháp nghiên cứu, tính logic',
  },
  {
    criteriaId: 'rc2',
    name: 'Đóng góp mới',
    weight: 0.3,
    score: null,
    description: 'Tính mới, sáng tạo của giải pháp',
  },
  {
    criteriaId: 'rc3',
    name: 'Kết quả thực nghiệm',
    weight: 0.2,
    score: null,
    description: 'Dữ liệu thực nghiệm, đánh giá kết quả',
  },
  {
    criteriaId: 'rc4',
    name: 'Tài liệu tham khảo',
    weight: 0.15,
    score: null,
    description: 'Chất lượng và độ phù hợp tài liệu tham khảo',
  },
];

// Trọng số tổng hợp điểm cuối
export const FINAL_SCORE_WEIGHTS = {
  supervisor: 0.6,
  reviewer: 0.4,
};
