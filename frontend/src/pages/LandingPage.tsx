import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import {
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Mic,
  Award,
  BookOpen,
  Volume2,
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { speakText } from '../utils/speech';

const { Title, Text, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTargetLanguage, openLangModal } = useAppStore();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0 60px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(88, 204, 2, 0.12)', border: '1.5px solid rgba(88, 204, 2, 0.3)', marginBottom: 20 }}>
          <Sparkles size={16} color="#58CC02" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#58CC02' }}>
            Luyện nói Giao tiếp Thực chiến Thế hệ Mới 🚀
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20, color: 'var(--duo-text-primary)' }}>
          Đừng chỉ học thuộc từ vựng đơn thuần.<br />
          <span className="gradient-text">Hãy tự tin nói chuẩn tự nhiên.</span>
        </h1>

        <Paragraph style={{ fontSize: 18, color: 'var(--duo-text-secondary)', maxWidth: 740, margin: '0 auto 36px', lineHeight: 1.6 }}>
          LinguaTalk đưa bạn hòa mình vào các tình huống giao tiếp đời thực bằng <strong>Tiếng Hàn</strong> và <strong>Tiếng Anh</strong>. Từ gọi món canh kim chi tại Seoul đến phỏng vấn và làm việc quốc tế, bạn sẽ làm chủ phát âm, đoạn hội thoại sinh động và trò chuyện phản xạ trực tiếp với AI.
        </Paragraph>

        <Space size="middle" wrap orientation="horizontal" style={{ justifyContent: 'center' }}>
          <button
            className="duo-btn-green"
            style={{ padding: '14px 28px', fontSize: 16 }}
            onClick={() => {
              setTargetLanguage('KO');
              navigate('/learn/1');
            }}
          >
            <span>Học bài Duolingo 🇰🇷</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="duo-btn-blue"
            style={{ padding: '14px 28px', fontSize: 16 }}
            onClick={() => {
              navigate('/chat');
            }}
          >
            <MessageSquare size={18} />
            <span>Trò chuyện AI (Duolingo Style)</span>
          </button>

          <button
            className="duo-btn-outline"
            style={{ padding: '14px 24px', fontSize: 15 }}
            onClick={() => {
              setTargetLanguage('EN');
              navigate('/learn/1');
            }}
          >
            <span>Luyện tiếng Anh 🇺🇸</span>
          </button>

          <Button
            type="text"
            onClick={() => navigate('/dashboard')}
            style={{ color: '#58CC02', fontWeight: 800, padding: '14px 20px', fontSize: 15 }}
          >
            Vào Bảng điều khiển ➔
          </Button>
        </Space>
      </div>

      {/* Methodology Section */}
      <div style={{ marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Text style={{ color: '#1CB0F6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13 }}>
            Quy trình Học tập LinguaTalk
          </Text>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 6, color: 'var(--duo-text-primary)' }}>
            Phương pháp Học Lấy Giao tiếp Thực chiến làm Trọng tâm
          </h2>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 15 }}>
            Xóa bỏ khoảng cách giữa lý thuyết sách vở và phản xạ giao tiếp tự nhiên ngoài đời sống.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {[
            { step: '1. Nạp từ vựng', title: 'Từ vựng & Cấu tạo Hangul', desc: 'Học từ trong ngữ cảnh thực tế với phiên âm IPA, quy tắc patchim, biến âm và cụm từ thường gặp.' },
            { step: '2. Thấu hiểu', title: 'Ngữ pháp theo Ngữ cảnh Xã hội', desc: 'Nắm vững cấp độ kính ngữ (존댓말 vs 반말, mẫu câu lịch sự tiếng Anh) với công thức dễ nhớ.' },
            { step: '3. Luyện nghe', title: 'Hội thoại Đa giọng nói Chân thực', desc: 'Lắng nghe từng câu thoại sinh động, rèn luyện phản xạ nghe hiểu với tốc độ 0.8x và 1.0x.' },
            { step: '4. Phát âm', title: 'Nhận diện Giọng nói AI', desc: 'Nói trực tiếp qua micro và nhận điểm đánh giá độ chính xác cùng góp ý chi tiết ngay lập tức.' },
            { step: '5. Phản xạ', title: 'Nhập vai Giao tiếp cùng AI', desc: 'Tương tác hỏi-đáp từng lượt với trợ lý AI (Bồi bàn, Barista, Phỏng vấn viên) trong tình huống thực tế.' },
            { step: '6. Ghi nhớ', title: 'Lặp lại Ngắt quãng (SM-2)', desc: 'Tự động phân bổ từ vựng khó và lỗi sai vào lịch ôn tập để kích hoạt trí nhớ dài hạn vĩnh viễn.' },
          ].map((item, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <div
                className="duo-card duo-card-interactive"
                style={{
                  padding: 24,
                  height: '100%',
                }}
              >
                <div style={{ color: '#58CC02', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: 'var(--duo-text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Interactive Demonstration Cards */}
      <div style={{ marginTop: 80 }}>
        <Row gutter={[24, 24]}>
          {/* Korean Spotlight */}
          <Col xs={24} lg={12}>
            <div className="duo-card duo-card-interactive" style={{ padding: 28, height: '100%', borderColor: 'rgba(206, 130, 255, 0.35)', borderBottomColor: '#A559D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, fontWeight: 800 }}>
                  🇰🇷 Điểm nhấn Tiếng Hàn
                </Tag>
                <button
                  className="duo-btn-outline"
                  onClick={() => speakText('안녕하세요. 김치찌개 하나 주세요.', 'KO')}
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  <Volume2 size={16} color="#1CB0F6" />
                  <span>Nghe phát âm</span>
                </button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                식당에서 주문하기 (Gọi món tại Nhà hàng)
              </div>
              <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Phân tích câu thành các thành phần sống động thay vì học vẹt máy móc:
              </p>

              {/* Breakdown chip */}
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--duo-bg)', border: '1.5px solid var(--duo-border)', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                  안녕하세요 = 안녕 (Bình an) + 하(다) (Chúc) + -세요 (Đuôi kính ngữ lịch sự)
                </div>
                <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)' }}>
                  💡 <strong>Quy tắc Patchim:</strong> Phụ âm 'ㅇ' trong '안/녕' tạo âm mũi mềm [aɲ.ɲʌŋ.ɦa.se.jo].
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontWeight: 700 }}>Trình độ: Mới bắt đầu (A1)</span>
                <button
                  className="duo-btn-purple"
                  onClick={() => {
                    setTargetLanguage('KO');
                    navigate('/topics');
                  }}
                  style={{ padding: '10px 20px', fontSize: 14 }}
                >
                  Bắt đầu Bài học Tiếng Hàn
                </button>
              </div>
            </div>
          </Col>

          {/* English Spotlight */}
          <Col xs={24} lg={12}>
            <div className="duo-card duo-card-interactive" style={{ padding: 28, height: '100%', borderColor: 'rgba(28, 176, 246, 0.35)', borderBottomColor: '#1899D6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Tag color="cyan" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, fontWeight: 800 }}>
                  🇺🇸 Điểm nhấn Tiếng Anh
                </Tag>
                <button
                  className="duo-btn-outline"
                  onClick={() => speakText('Could I please get an iced oat latte with an extra shot?', 'EN')}
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  <Volume2 size={16} color="#1CB0F6" />
                  <span>Nghe phát âm</span>
                </button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                Specialty Coffee & Giao tiếp Đời thực
              </div>
              <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Học cách đề nghị lịch sự và cụm từ bản xứ thay vì dịch thô từ tiếng mẹ đẻ:
              </p>

              {/* Phrasing chip */}
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--duo-bg)', border: '1.5px solid var(--duo-border)', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                  Dùng "Could I please get..." thay vì câu cụt ngủn "Give me a coffee"
                </div>
                <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)' }}>
                  💡 <strong>Cụm từ tự nhiên:</strong> "Single-origin pour-over", "Make that to-go", "Under the name..."
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontWeight: 700 }}>Trình độ: Trung cấp (B1)</span>
                <button
                  className="duo-btn-blue"
                  onClick={() => {
                    setTargetLanguage('EN');
                    navigate('/topics');
                  }}
                  style={{ padding: '10px 20px', fontSize: 14 }}
                >
                  Bắt đầu Bài học Tiếng Anh
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* AI Conversation Partner Callout */}
      <div
        className="duo-card"
        style={{
          marginTop: 60,
          padding: '40px 30px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.1) 0%, rgba(28, 176, 246, 0.08) 100%)',
          borderColor: 'rgba(88, 204, 2, 0.35)',
          borderBottomColor: '#46A302',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: 'var(--duo-text-primary)' }}>
          Luyện phản xạ Nói từng lượt cùng Bạn học AI
        </h2>
        <Paragraph style={{ color: 'var(--duo-text-secondary)', maxWidth: 680, margin: '0 auto 24px', fontSize: 16, lineHeight: 1.6 }}>
          Trải nghiệm hơn 20+ tình huống thực tế: Phỏng vấn xin việc, Gọi cà phê, Nhận phòng khách sạn, Khám bác sĩ và Đi tàu điện ngầm. Nói trực tiếp qua micro và nhận phản hồi chi tiết về độ trôi chảy, ngữ pháp cùng gợi ý cách diễn đạt bản xứ tự nhiên hơn.
        </Paragraph>
        <button
          className="duo-btn-green"
          style={{ padding: '14px 32px', fontSize: 16 }}
          onClick={() => navigate('/chat')}
        >
          <span>Bắt đầu Luyện Hội thoại với AI</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
