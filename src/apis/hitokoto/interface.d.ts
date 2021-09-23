export interface HitokotoType {
  id: number;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who: null;
  creator: string;
  creator_uid: number;
  reviewer: number;
  commit_from: string;
  created_at: string;
  length: number;
}

// 一言来源 d文学 h影视 i诗词
export type HitokotoCType = 'd' | 'h' | 'i';

export interface HitokotoParamsType {
  c: HitokotoCType;
}
