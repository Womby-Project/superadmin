// src/types/mammoth-browser.d.ts
declare module "mammoth/mammoth.browser" {
  const mammoth: {
    convertToHtml(
      input: { arrayBuffer: ArrayBuffer },
      options?: any
    ): Promise<{ value: string }>;
  };
  export default mammoth;
}
