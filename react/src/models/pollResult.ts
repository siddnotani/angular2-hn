// Before fetchItemContent resolves the options, node-hnapi's `poll` entries are `{ item, points }`;
// afterwards each entry is the poll option item itself (`{ points, content, ... }`).
export interface PollResult {
  points: number;
  content?: string;
  item?: string;
}
