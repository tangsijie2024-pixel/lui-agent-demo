export function buildDecidedInstruction(
  decidedPlace: string,
  state: 'decided' | 'following_up'
): string {
  if (state === 'decided') {
    return `用户选定了"${decidedPlace}"。用朋友口吻确认他的选择，可以加一个贴心小提示或期待感，自然短句，不要感叹号堆砌。`;
  }
  return `用户在追问"${decidedPlace}"的详情。根据对话历史回答他的问题，像朋友一样自然，简短直接。`;
}
