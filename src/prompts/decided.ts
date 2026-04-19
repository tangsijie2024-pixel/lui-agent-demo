export function buildDecidedInstruction(
  decidedPlace: string,
  state: 'decided' | 'following_up'
): string {
  if (state === 'decided') {
    return `用户选定了"${decidedPlace}"。用一两句话确认他的选择，只补充对话历史里没有提到过的新信息（比如最佳时段、氛围细节、到场小建议），不要重复卡片或之前消息里已经说过的内容。自然短句，不要感叹号堆砌。`;
  }
  return `用户在追问"${decidedPlace}"的详情。根据对话历史回答他的具体问题，不要重复之前已经说过的信息，像朋友一样自然，简短直接。`;
}
