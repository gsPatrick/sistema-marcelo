import MessageNode from './MessageNode';
import QuestionNode from './QuestionNode';
import HandoverNode from './HandoverNode';
import DisqualifyNode from './DisqualifyNode';

export const nodeTypes = {
    message: MessageNode,
    question: QuestionNode,
    handover: HandoverNode,
    disqualify: DisqualifyNode
};
