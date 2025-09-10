export {};

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider & {
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
    };
  }
}
