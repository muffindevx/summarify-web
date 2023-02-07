export type SummaryResponse = {
  transcribe: string;
  summary: string;
};

const fetch_summarize = async (audio: File): Promise<SummaryResponse> => {
  console.log(import.meta.env.PUBLIC_API_URL);
  const form_data = new FormData();
  form_data.append('audio', audio);

  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/summarize`, {
    method: 'POST',
    body: form_data,
  });

  const data = await response.json();
  if (response.ok) {
    return data;
  }

  throw new Error(data.message);
};

const convert_mb = (size: number | undefined): string => {
  if (!size) return '0 Bytes';

  const sizes = ['B', 'KB', 'MB'];
  const index_size = Math.floor(Math.log(size) / Math.log(1024));
  const value = size / Math.pow(1024, index_size);

  return `${value.toFixed(2)} ${sizes[index_size]}`;
};

export { fetch_summarize, convert_mb };
