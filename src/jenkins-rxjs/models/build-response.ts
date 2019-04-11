export interface BuildResponse {
  _class: string;
  building: boolean;
  description?: null;
  displayName: string;
  duration: number; // 0 before finish
  estimatedDuration: number; // always the same
  fullDisplayName: string;
  id: string;
  number: number;
  queueId: number;
  result?: ResultType;
  timestamp: number; // when it started
  url: string;
}

export type ResultType = 'FAILURE' | 'SUCCESS';
