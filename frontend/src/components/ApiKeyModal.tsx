import React, { useState } from 'react';
import { Modal, Input, Radio, Button, Tag, Space, Typography, message, Divider } from 'antd';
import { Key, Sparkles, CheckCircle, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { generateCustomScenario } from '../services/aiGenerator';

const { Text, Paragraph, Title } = Typography;

export const ApiKeyModal: React.FC = () => {
  const {
    isApiKeyModalOpen,
    closeApiKeyModal,
    apiKey,
    apiProvider,
    setApiKey,
    targetLanguage,
    targetLevel,
    addCustomScenario,
  } = useAppStore();

  const [inputKey, setInputKey] = useState(apiKey);
  const [provider, setProvider] = useState<'gemini' | 'openai'>(apiProvider);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveKey = () => {
    setApiKey(inputKey.trim(), provider);
    message.success('Đã lưu cấu hình API Key thành công!');
  };

  const handleGenerateScenario = async () => {
    if (!promptInput.trim()) {
      message.error('Vui lòng nhập mô tả tình huống bạn muốn luyện tập!');
      return;
    }
    setIsGenerating(true);
    try {
      const scenario = await generateCustomScenario({
        prompt: promptInput.trim(),
        language: targetLanguage,
        level: targetLevel,
        apiKey: inputKey || apiKey,
        provider,
      });

      addCustomScenario(scenario);
      message.success(`Đã tạo thành công kịch bản: "${scenario.title}"!`);
      setPromptInput('');
      closeApiKeyModal();
    } catch (err) {
      message.error('Có lỗi khi tạo kịch bản với AI');
    } finally {
      setIsGenerating(false);
    }
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
              background: 'linear-gradient(135deg, #FFC800, #FF9600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Key size={20} color="#131F24" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Cấu hình API Key & Tự tạo Kịch bản AI</span>
        </div>
      }
      open={isApiKeyModalOpen}
      onCancel={closeApiKeyModal}
      footer={null}
      width={640}
      centered
      styles={{
        body: {
          maxHeight: 'calc(85vh - 70px)',
          overflowY: 'auto',
          paddingRight: 4,
        },
      }}
    >
      <div style={{ marginTop: 16 }}>
        {/* API Key Status Notice */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: apiKey ? 'rgba(88, 204, 2, 0.12)' : 'rgba(255, 200, 0, 0.12)',
            border: apiKey ? '2px solid #58CC02' : '2px solid #FFC800',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {apiKey ? <CheckCircle size={20} color="#58CC02" /> : <Zap size={20} color="#FFC800" />}
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#FFFFFF' }}>
                {apiKey ? 'API Key đang kích hoạt' : 'Đang dùng AI sư phạm tích hợp'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)' }}>
                {apiKey
                  ? `Sử dụng ${apiProvider.toUpperCase()} để sinh hội thoại trực tiếp.`
                  : 'Bạn có thể điền API Key để tạo không giới hạn kịch bản tùy ý.'}
              </div>
            </div>
          </div>
          <Tag color={apiKey ? 'green' : 'gold'} style={{ fontWeight: 800 }}>
            {apiKey ? 'ĐÃ KÍCH HOẠT' : 'MẶC ĐỊNH'}
          </Tag>
        </div>

        {/* Provider selection */}
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', marginBottom: 8 }}>
            1. Chọn nhà cung cấp AI:
          </Text>
          <Radio.Group
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ display: 'flex', gap: 12 }}
          >
            <Radio.Button value="gemini" style={{ borderRadius: 12, padding: '6px 16px', height: 'auto', fontWeight: 700 }}>
              Google Gemini (Khuyên dùng - Miễn phí)
            </Radio.Button>
            <Radio.Button value="openai" style={{ borderRadius: 12, padding: '6px 16px', height: 'auto', fontWeight: 700 }}>
              OpenAI (GPT-4o)
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Input Key */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontWeight: 800, color: '#FFFFFF' }}>2. Nhập API Key:</Text>
            {provider === 'gemini' ? (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: '#1CB0F6', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>Lấy Gemini API Key miễn phí</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: '#1CB0F6', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>Lấy OpenAI API Key</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <Input.Password
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
            style={{
              background: 'var(--duo-card-bg)',
              borderColor: 'var(--duo-border)',
              borderRadius: 12,
              padding: '10px 14px',
              color: 'var(--duo-text-primary)',
            }}
          />
        </div>

        <button
          className="duo-btn-blue"
          onClick={handleSaveKey}
          style={{ width: '100%', marginBottom: 24 }}
        >
          <span>Lưu cấu hình API Key</span>
        </button>

        <Divider style={{ borderColor: 'var(--duo-border)' }} />

        {/* Fast AI Scenario Generator */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={18} color="#FFC800" />
            <Text style={{ fontWeight: 800, fontSize: 16, color: 'var(--duo-text-primary)' }}>
              Tự tạo Kịch bản Giao tiếp AI
            </Text>
          </div>
          <Paragraph style={{ fontSize: 13, color: 'var(--duo-text-secondary)', marginBottom: 12 }}>
            Nhập chủ đề hoặc tình huống thực tế bạn muốn luyện tập. AI sẽ tự động tạo vai diễn, câu chào ban đầu và bối cảnh văn hóa phù hợp:
          </Paragraph>

          <Input.TextArea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ví dụ: Luyện tập trả giá khi mua quần áo ở chợ Dongdaemun Seoul, hoặc Phỏng vấn xin việc vị trí Marketing..."
            style={{
              background: 'var(--duo-card-bg)',
              borderColor: 'var(--duo-border)',
              borderRadius: 12,
              color: 'var(--duo-text-primary)',
              marginBottom: 14,
            }}
          />

          <button
            className="duo-btn-green"
            onClick={handleGenerateScenario}
            disabled={isGenerating || !promptInput.trim()}
            style={{ width: '100%' }}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Đang tạo kịch bản...' : 'Tạo Kịch bản & Thêm vào Trò chuyện'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
