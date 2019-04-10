export interface QueueResponse {
  _class: string;
  actions: ActionsEntity[];
  blocked: boolean;
  buildable: boolean;
  id: number;
  inQueueSince: number;
  params: string;
  stuck: boolean;
  task: Task;
  url: string;
}

export interface QueuedResponse extends QueueResponse {
  why: string;
  timestamp: number;
}

export function isQueuedResponse(response: QueueResponse): response is QueueResponse {
  return !(response as ExecutedResponse).executable;
}

export interface ExecutedResponse extends QueueResponse {
  cancelled: boolean;
  executable: Executable;
}

export function isExecutedResponse(response: QueueResponse): response is ExecutedResponse {
  return !!(response as ExecutedResponse).executable;
}

export interface ActionsEntity {
  _class: string;
  parameters?: any[];
  causes?: any[];
}

export interface Task {
  _class: string;
  name: string;
  url: string;
  color: string;
}

export interface Executable {
  _class: string;
  number: number;
  url: string;
}
