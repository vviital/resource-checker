export interface IFileStorageModelInput {
  data?: string|Buffer;
  filename: string;
  id?: string;
  stream?: NodeJS.ReadableStream;
};

export interface IFileStorageModelOutput {
  created?: Date;
  filename?: string;
  id: string;
  publicUrl?: string;
  updated?: Date;
};
