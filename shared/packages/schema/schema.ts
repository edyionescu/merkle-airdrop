declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }

  interface Eip1193Provider {
    request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  }
}

export interface ClaimData {
  success: boolean;
  merkleProof: string[];
  index: number;
  amount: number;
  units: number;
  symbol: string;
}

export interface State {
  status: string;
  loading: boolean;
}

export interface AirdropAccount {
  address: string;
  index: number;
  amount: number;
}
