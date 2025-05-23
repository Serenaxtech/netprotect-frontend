import { useState, useEffect } from 'react';
import { ConfigApiService, AgentConfig } from '@/services/api/configApi';

export interface ConfigField {
  key: string;
  value: string;
  isEditable: boolean;
}

export interface ConfigSection {
  name: string;
  originalName: string;
  isEditable: boolean;
  isSectionNameEditable: boolean;
  isQuerySection: boolean;
  fields: ConfigField[];
}

interface ConfigLine {
  key: string;
  value: string;
  isEditable: boolean;
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
          originalName: sectionName,
          isEditable: true,
          isSectionNameEditable: sectionName.startsWith('[query_') || sectionName === '[adlab.local]',
          isQuerySection: sectionName.startsWith('[query_'),
          fields: []
        };
      } else if (currentSection && line.trim()) {
        const [key, value] = line.split('=').map(part => part.trim());
        if (key && value !== undefined) {
          let isEditable = true;
          if (currentSection.name === '[agent]') {
            isEditable = key === 'AUTH-Token';
          }
          currentSection.fields.push({ key, value, isEditable });
        }
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
      try {
        await ConfigApiService.getAgentConfig(agentId);
        await fetchConfig();
        return;
      } catch (err) {
        // Config doesn't exist, create with empty token
        const initialConfig = `[agent]
Agent-ID = ${agentId}
Agent-Name = ${agentName}
AUTH-Token = REDACTED

[backend-api]
base-api = http://localhost:5000
base-endpoint = /api/v1/

[proxy]
proxy-url = None
proxy-auth = None

[adlab.local]
Username = ADLAB\\ldapuser
Password = UserPass1234!
LDAP-username = ldapuser@adlab.local
LDAP-query = (&(objectCategory=computer)(operatingSystem=*Windows*))
Max-size = 5M
Num-of-threads = 10
Spider-depth = 2
Excluded-shares = PRINT$ ADMIN$ BACKUP
Extensions = pfx p12 pem key
Excluded-extensions = zip exe tar
Content-regex = ((secret|password|credentials|.*passe)\s{0,1}[:=]\S*)
File-regex = (secret|password|credentials|.*passe)
LDAP=389
LDAPS=636
AUTH-Method=NTLM

[query_get_all_windows_servers]
filter = (objectCategory=computer)
attributes = cn, operatingSystem
scope = subtree
base=

[query_get_all_users]
filter = (objectClass=user)
attributes = sAMAccountName, displayName
scope =
base=

[query_get_all_groups]
filter = (&(objectClass=group)(member=*))
attributes = sAMAccountName, displayName, description, member, memberOf, whenCreated, whenChanged
scope = subtree
base=`;
        
        await ConfigApiService.createAgentConfig(agentId, initialConfig);
        await fetchConfig();
      }
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
      const rawConfig = newSections.map(section => {
        const fields = section.fields.map(field => `${field.key} = ${field.value}`).join('\n');
        return `${section.name}\n${fields}`;
      }).join('\n\n');
      await ConfigApiService.updateAgentConfig(agentId, rawConfig);
      await fetchConfig();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err; // Re-throw to handle in the component
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