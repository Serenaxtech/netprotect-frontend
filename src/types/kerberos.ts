export interface KerberosUser {
  sAMAccountName: string;
  servicePrincipalName?: string[];
  pwdLastSet: string;
  lastLogon: string;
  memberOf?: string[];
  description?: string;
  dn: string;
  userAccountControl?: string;
}

export interface DomainEncryption {
  'msDS-SupportedEncryptionTypes': string;
  distinguishedName: string;
}

export interface DelegationComputer {
  sAMAccountName: string;
  userAccountControl: string;
  servicePrincipalName?: string[];
  dNSHostName?: string;
  objectClass: string;
  dn: string;
  'msDS-AllowedToDelegateTo'?: string[];
  'msDS-AllowedToActOnBehalfOfOtherIdentity'?: string;
}

export interface KerberosData {
  kerberoastable_users: KerberosUser[];
  asreproast_users: KerberosUser[];
  domain_encryption: DomainEncryption[];
  unconstrained_delegation: DelegationComputer[];
  constrained_delegation: DelegationComputer[];
  resource_based_constrained_delegation: DelegationComputer[];
}