import { useState, useEffect } from 'react';
import { ConfigApiService, AgentConfig } from '@/services/api/configApi';

export interface ConfigSection {
  name: string;
  isEditable: boolean;
  content: string;
}

export const useAgentConfig = (agentId: string, agentName: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [sections, setSections] = useState<ConfigSection[]>([]);

  const parseConfig = (rawConfig: string): ConfigSection[] => {
    const lines = rawConfig.split('\n');
    const sections: ConfigSection[] = [];
    let currentSection: ConfigSection | null = null;

    for (const line of lines) {
      if (line.trim().startsWith('[')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const sectionName = line.trim();
        currentSection = {
          name: sectionName,
          isEditable: !sectionName.includes('agent'),
          content: line + '\n'
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const configData = await ConfigApiService.getAgentConfig(agentId);
      setConfig(configData);
      setSections(parseConfig(configData.rawConfig));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createInitialConfig = async () => {
    try {
      setLoading(true);
      const token = await ConfigApiService.getAgentToken(agentId);
      const initialConfig = `[agent]\nAgent-ID = ${agentId}\nAgent-Name = ${agentName}\nAUTH-Token = ${token}\n\n[backend-api]\nbase-api = http://localhost:5000\nbase-endpoint = /api/v1/\n\n[proxy]\nproxy-url = None\nproxy-auth = None`;
      
      await ConfigApiService.createAgentConfig(agentId, initialConfig);
      await fetchConfig();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newSections: ConfigSection[]) => {
    try {
      setLoading(true);
      const rawConfig = newSections.map(section => section.content.trim()).join('\n\n');
      await ConfigApiService.updateAgentConfig(agentId, rawConfig);
      await fetchConfig();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [agentId]);

  return {
    loading,
    error,
    config,
    sections,
    createInitialConfig,
    updateConfig,
  };
};