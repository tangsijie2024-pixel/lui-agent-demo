import { QueryRequest, AgentResponse } from './types';
import { handlePassiveQuery } from './agent';

export const handleMcpQuery = (request: QueryRequest): AgentResponse => {
  return handlePassiveQuery(request);
};
