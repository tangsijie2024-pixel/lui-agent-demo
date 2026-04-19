import { QueryRequest, AgentResponse } from './types';
import { handlePassiveQuery } from './agent';

export const handleIMessageQuery = (request: QueryRequest): AgentResponse => {
  return handlePassiveQuery(request);
};
