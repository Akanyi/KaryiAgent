"""
AI Module - AI 提供商抽象层
===========================

支持多个 LLM 提供商的统一接口：
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Google (Gemini)
- OpenRouter (多模型聚合)
- OpenAI 兼容平台 (任意兼容接口)
"""

import os
import json
from typing import Dict, Any, List, Optional, Generator
from abc import ABC, abstractmethod


class AIProvider(ABC):
    """AI 提供商抽象基类"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None, **kwargs):
        self.api_key = api_key
        self.base_url = base_url
        self.extra_params = kwargs
    
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """发送聊天请求"""
        pass
    
    @abstractmethod
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        """流式聊天请求"""
        pass


class OpenAIProvider(AIProvider):
    """OpenAI 提供商 (ChatGPT)"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None, model: str = "gpt-4", **kwargs):
        super().__init__(api_key, base_url or "https://api.openai.com/v1", **kwargs)
        self.model = model
        self.client = None
    
    def _ensure_client(self):
        if self.client is None:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            except ImportError:
                raise ImportError("openai package not installed. Run: pip install openai")
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        self._ensure_client()
        
        response = self.client.chat.completions.create(
            model=kwargs.get('model', self.model),
            messages=messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
            **{k: v for k, v in kwargs.items() if k not in ['model', 'temperature', 'max_tokens']}
        )
        
        return {
            'content': response.choices[0].message.content,
            'model': response.model,
            'tokens': {
                'prompt': response.usage.prompt_tokens,
                'completion': response.usage.completion_tokens,
                'total': response.usage.total_tokens,
            },
            'finish_reason': response.choices[0].finish_reason,
        }
    
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        self._ensure_client()
        
        stream = self.client.chat.completions.create(
            model=kwargs.get('model', self.model),
            messages=messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
            stream=True,
            **{k: v for k, v in kwargs.items() if k not in ['model', 'temperature', 'max_tokens']}
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class AnthropicProvider(AIProvider):
    """Anthropic 提供商 (Claude)"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022", **kwargs):
        super().__init__(api_key, base_url, **kwargs)
        self.model = model
        self.client = None
    
    def _ensure_client(self):
        if self.client is None:
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=self.api_key)
            except ImportError:
                raise ImportError("anthropic package not installed. Run: pip install anthropic")
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        self._ensure_client()
        
        # 分离 system 消息
        system_message = None
        chat_messages = []
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                chat_messages.append(msg)
        
        response = self.client.messages.create(
            model=kwargs.get('model', self.model),
            system=system_message,
            messages=chat_messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
        )
        
        return {
            'content': response.content[0].text,
            'model': response.model,
            'tokens': {
                'prompt': response.usage.input_tokens,
                'completion': response.usage.output_tokens,
                'total': response.usage.input_tokens + response.usage.output_tokens,
            },
            'finish_reason': response.stop_reason,
        }
    
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        self._ensure_client()
        
        # 分离 system 消息
        system_message = None
        chat_messages = []
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                chat_messages.append(msg)
        
        with self.client.messages.stream(
            model=kwargs.get('model', self.model),
            system=system_message,
            messages=chat_messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
        ) as stream:
            for text in stream.text_stream:
                yield text


class GeminiProvider(AIProvider):
    """Google Gemini 提供商（使用新的 google-genai SDK）"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None, model: str = "gemini-2.5-flash", **kwargs):
        super().__init__(api_key, base_url, **kwargs)
        self.model = model
        self.client = None
    
    def _ensure_client(self):
        if self.client is None:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except ImportError:
                raise ImportError("google-genai package not installed. Run: pip install google-genai")
    
    def _convert_messages(self, messages: List[Dict[str, str]]) -> tuple:
        """转换消息格式为 Gemini 格式"""
        system_instruction = None
        chat_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_instruction = msg['content']
            elif msg['role'] == 'user':
                chat_messages.append({'role': 'user', 'parts': [msg['content']]})
            elif msg['role'] == 'assistant':
                chat_messages.append({'role': 'model', 'parts': [msg['content']]})
        
        return system_instruction, chat_messages
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        self._ensure_client()
        from google.genai import types
        
        # 提取 system instruction
        system_instruction = None
        contents = []
        for msg in messages:
            if msg['role'] == 'system':
                system_instruction = msg['content']
            else:
                contents.append(msg['content'])
        
        # 构建配置
        config = types.GenerateContentConfig(
            temperature=kwargs.get('temperature', 0.7),
            max_output_tokens=kwargs.get('max_tokens', 4096),
        )
        if system_instruction:
            config.system_instruction = system_instruction
        
        # 调用新 API
        response = self.client.models.generate_content(
            model=self.model,
            contents=contents[-1] if len(contents) == 1 else contents,
            config=config
        )
        
        return {
            'content': response.text,
            'model': self.model,
            'tokens': {
                'prompt': response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0,
                'completion': response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0,
                'total': response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0,
            },
            'finish_reason': str(response.candidates[0].finish_reason) if response.candidates else 'STOP',
        }
    
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        self._ensure_client()
        from google.genai import types
        
        # 提取 system instruction
        system_instruction = None
        contents = []
        for msg in messages:
            if msg['role'] == 'system':
                system_instruction = msg['content']
            else:
                contents.append(msg['content'])
        
        # 构建配置
        config = types.GenerateContentConfig(
            temperature=kwargs.get('temperature', 0.7),
            max_output_tokens=kwargs.get('max_tokens', 4096),
        )
        if system_instruction:
            config.system_instruction = system_instruction
        
        # 调用新 API 流式接口
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=contents[-1] if len(contents) == 1 else contents,
            config=config
        ):
            if chunk.text:
                yield chunk.text


class OpenRouterProvider(AIProvider):
    """OpenRouter 提供商 (多模型聚合)"""
    
    def __init__(self, api_key: str, base_url: str = "https://openrouter.ai/api/v1", model: str = "anthropic/claude-3.5-sonnet", **kwargs):
        super().__init__(api_key, base_url, **kwargs)
        self.model = model
        self.client = None
    
    def _ensure_client(self):
        if self.client is None:
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except ImportError:
                raise ImportError("openai package not installed. Run: pip install openai")
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        self._ensure_client()
        
        response = self.client.chat.completions.create(
            model=kwargs.get('model', self.model),
            messages=messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
        )
        
        return {
            'content': response.choices[0].message.content,
            'model': response.model,
            'tokens': {
                'prompt': response.usage.prompt_tokens if response.usage else 0,
                'completion': response.usage.completion_tokens if response.usage else 0,
                'total': response.usage.total_tokens if response.usage else 0,
            },
            'finish_reason': response.choices[0].finish_reason,
        }
    
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        self._ensure_client()
        
        stream = self.client.chat.completions.create(
            model=kwargs.get('model', self.model),
            messages=messages,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 4096),
            stream=True,
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class AIManager:
    """AI 管理器 - 统一的 AI 接口"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化 AI 管理器
        
        config 示例:
        {
            "provider": "openai",  # openai, anthropic, gemini, openrouter, openai-compatible
            "api_key": "sk-...",
            "model": "gpt-4",
            "base_url": "https://api.openai.com/v1",  # 可选
            "temperature": 0.7,
            "max_tokens": 4096
        }
        """
        self.config = config
        self.provider = self._create_provider()
    
    def _create_provider(self) -> AIProvider:
        """根据配置创建提供商实例"""
        provider_type = self.config.get('provider', 'openai').lower()
        api_key = self.config.get('api_key') or os.getenv('AI_API_KEY')
        
        if not api_key:
            raise ValueError("API key is required")
        
        model = self.config.get('model')
        base_url = self.config.get('base_url')
        
        if provider_type == 'openai':
            return OpenAIProvider(api_key, base_url, model=model or "gpt-4")
        elif provider_type == 'anthropic':
            return AnthropicProvider(api_key, base_url, model=model or "claude-3-5-sonnet-20241022")
        elif provider_type == 'gemini':
            return GeminiProvider(api_key, base_url, model=model or "gemini-2.5-flash")
        elif provider_type == 'openrouter':
            return OpenRouterProvider(api_key, base_url or "https://openrouter.ai/api/v1", model=model or "anthropic/claude-3.5-sonnet")
        elif provider_type == 'openai-compatible':
            if not base_url:
                raise ValueError("base_url is required for openai-compatible provider")
            return OpenAIProvider(api_key, base_url, model=model or "gpt-4")
        else:
            raise ValueError(f"Unsupported provider: {provider_type}")
    
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """发送聊天请求"""
        # 合并配置和运行时参数
        params = {
            'temperature': self.config.get('temperature', 0.7),
            'max_tokens': self.config.get('max_tokens', 4096),
            **kwargs
        }
        return self.provider.chat(messages, **params)
    
    def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> Generator[str, None, None]:
        """流式聊天请求"""
        params = {
            'temperature': self.config.get('temperature', 0.7),
            'max_tokens': self.config.get('max_tokens', 4096),
            **kwargs
        }
        return self.provider.stream_chat(messages, **params)
