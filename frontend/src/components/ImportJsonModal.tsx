import React, { useState } from 'react';
import { Modal, Input, Typography, message, Space, Tag, Upload } from 'antd';
import { FileCode, UploadCloud, CheckCircle, Copy, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/useAppStore';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const SAMPLE_KOREAN_JSON = `[
  {
    "title": "Mua sắm tại chợ Dongdaemun (동대문 쇼핑)",
    "languageCode": "KO",
    "levelCode": "BEGINNER",
    "userRole": "Khách mua hàng (손님)",
    "aiRole": "Chủ tiệm quần áo (사장님)",
    "description": "Luyện tập hỏi giá, hỏi size áo và mặc cả lịch sự bằng tiếng Hàn.",
    "initialGreeting": "어서오세요! 편하게 구경하세요. 마음에 드는 옷 있으신가요?",
    "culturalContext": "Tại các chợ truyền thống ở Hàn Quốc, bạn có thể nói '조금만 깎아주세요' (bớt một chút đi ạ) một cách thân thiện."
  },
  {
    "title": "Hỏi đường tại ga Gangnam (강남역에서 길 묻기)",
    "languageCode": "KO",
    "levelCode": "ELEMENTARY",
    "userRole": "Khách du lịch (여행자)",
    "aiRole": "Người đi đường (행인)",
    "description": "Hỏi lối ra số 11 và cách đi bộ đến tòa nhà Kyobo.",
    "initialGreeting": "네, 안녕하세요! 어디 찾으시나요?",
    "culturalContext": "Luôn mở đầu bằng '저기요, 실례지만...' để thể hiện sự lễ phép khi làm phiền người khác."
  }
]`;

const SAMPLE_ENGLISH_JSON = `[
  {
    "title": "Checking in at a Boutique Hotel",
    "languageCode": "EN",
    "levelCode": "INTERMEDIATE",
    "userRole": "Guest",
    "aiRole": "Front Desk Receptionist",
    "description": "Practice check-in, requesting a high-floor quiet room, and asking about complimentary breakfast.",
    "initialGreeting": "Good afternoon, welcome to The Grand Hotel! Are you checking in today?",
    "culturalContext": "Use polite modal expressions like 'Could I possibly request a room on a higher floor?'"
  }
]`;

export const ImportJsonModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, importScenariosFromJson } = useAppStore();
  const [jsonText, setJsonText] = useState(SAMPLE_KOREAN_JSON);

  const handleImport = () => {
    if (!jsonText.trim()) {
      message.error('Vui lòng nhập hoặc dán nội dung JSON!');
      return;
    }

    const res = importScenariosFromJson(jsonText.trim());
    if (res.success) {
      message.success(`Đã nạp thành công ${res.count} kịch bản hội thoại mới!`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      closeImportModal();
    } else {
      message.error(res.error || 'JSON không đúng cấu trúc');
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setJsonText(content);
        message.success(`Đã đọc tệp ${file.name}`);
      }
    };
    reader.readAsText(file);
    return false; // prevent default upload POST
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #1CB0F6, #1899D6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCode size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Nạp JSON Hội thoại có sẵn</span>
        </div>
      }
      open={isImportModalOpen}
      onCancel={closeImportModal}
      footer={null}
      width={680}
      centered
    >
      <div style={{ marginTop: 14 }}>
        <Paragraph style={{ fontSize: 13, color: 'var(--duo-text-secondary)', marginBottom: 14 }}>
          Bạn có thể nạp các kịch bản hội thoại có sẵn bằng tệp JSON hoặc dán trực tiếp. Hội thoại sau khi nạp sẽ hiển thị ngay trong danh sách luyện tập của bạn!
        </Paragraph>

        {/* Quick Sample Fill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-secondary)' }}>
            Dùng mẫu có sẵn:
          </Text>
          <button
            className="duo-btn-outline"
            onClick={() => setJsonText(SAMPLE_KOREAN_JSON)}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <span>🇰🇷 Mẫu tiếng Hàn (Chợ & Hỏi đường)</span>
          </button>
          <button
            className="duo-btn-outline"
            onClick={() => setJsonText(SAMPLE_ENGLISH_JSON)}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <span>🇺🇸 Mẫu tiếng Anh (Khách sạn)</span>
          </button>
        </div>

        {/* Upload File Dragger */}
        <Upload.Dragger
          accept=".json"
          showUploadList={false}
          beforeUpload={handleFileUpload}
          style={{
            background: '#131F24',
            borderColor: 'var(--duo-border)',
            borderRadius: 14,
            marginBottom: 16,
            padding: '16px 0',
          }}
        >
          <p style={{ margin: 0 }}>
            <UploadCloud size={28} color="#1CB0F6" />
          </p>
          <p style={{ color: '#FFFFFF', fontWeight: 700, margin: '6px 0 2px' }}>
            Kéo thả hoặc bấm để chọn tệp .json
          </p>
          <p style={{ color: 'var(--duo-text-muted)', fontSize: 12, margin: 0 }}>
            Hỗ trợ định dạng JSON mảng hoặc đối tượng kịch bản
          </p>
        </Upload.Dragger>

        {/* JSON Editor Textarea */}
        <div style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>
            Nội dung JSON:
          </Text>
          <TextArea
            rows={9}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              background: '#131F24',
              borderColor: 'var(--duo-border)',
              borderRadius: 12,
              color: '#58CC02',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: 12,
            }}
          />
        </div>

        <button
          className="duo-btn-green"
          onClick={handleImport}
          style={{ width: '100%', padding: '14px' }}
        >
          <CheckCircle size={18} />
          <span>Nạp & Thêm vào Danh sách Hội thoại</span>
        </button>
      </div>
    </Modal>
  );
};
