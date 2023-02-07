import type { JSX } from 'solid-js';
import { createSignal, batch, ErrorBoundary, Show } from 'solid-js';
import { convert_mb, fetch_summarize, SummaryResponse } from '../lib/audio';
import LoadingSpinner from './LoadingSpinner';

const MAX_AUDIO_SIZE = 1000000;

const Summarize = () => {
  const [audio_file, set_audio_file] = createSignal<File>();
  const [summary, set_summary] = createSignal<SummaryResponse>();
  const [error, set_error] = createSignal('');
  const [loading, set_loading] = createSignal(false);

  const handle_upload_file: JSX.EventHandler<HTMLInputElement, Event> = (
    evt,
  ) => {
    if (evt.currentTarget.files) {
      const file = evt.currentTarget.files[0];

      batch(() => {
        set_summary(undefined);
        set_error('');
      });

      if (!file) return;

      if (file.size === 0) {
        set_error('This file is empty');
      }

      if (file.size > MAX_AUDIO_SIZE) {
        set_error('This file is greater than 1 MB.');
      }

      set_audio_file(file);
    }
  };

  const handle_summarize = async () => {
    if (audio_file() && !loading()) {
      try {
        set_loading(true);
        const data = await fetch_summarize(audio_file() as File);
        set_loading(false);
        set_summary(data);
      } catch (error) {
        const message = (error as Error).message;
        set_loading(false);
        set_error(message);
      }
    }
  };

  const handle_remove_file = () => {
    set_audio_file(undefined);
  };

  const handle_clean = () => {
    batch(() => {
      set_audio_file(undefined);
      set_summary(undefined);
      set_error('');
    });
  };

  const handle_copy = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
      <section class="container mx-auto max-w-6xl px-3 md:px-0">
        <div class="my-4 p-4 rounded-lg border-2 border-dashed border-red-600">
          <p class="text-sm font-semibold text-red-600">
            This process can take time. Remember that transcription and
            summarization is not a 100% accurate model.
          </p>
        </div>

        <div class="flex items-center justify-center mx-auto ">
          <label
            for="dropzone-audio"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                aria-hidden="true"
                class="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">Click to upload</span> or drag and
                drop
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                WAV, MP3 or MP4 (Max. 1MB)
              </p>
            </div>
            <input
              id="dropzone-audio"
              type="file"
              class="hidden"
              onChange={handle_upload_file}
              accept=".wav,.mp3,.mp4"
            />
          </label>
        </div>
        <Show when={audio_file()}>
          <div class="flex justify-between items-center mt-4 p-4 bg-slate-100 shadow-md rounded-lg">
            <div class="flex flex-col">
              <section class="flex items-center">
                <figure class="w-6 h-6 mr-6 sm:w-8 sm:h-8">
                  <img
                    src="/icons/musical-notes-outline.svg"
                    alt="Icon to indicate that this file is an audio"
                  />
                </figure>
                <article class="flex flex-col flex-nowrap sm:flex-wrap">
                  <p class="text-md font-semibold truncate w-60 sm:w-auto">
                    {audio_file()?.name}
                  </p>
                  <span class="text-sm font-semibold text-slate-600">
                    {convert_mb(audio_file()?.size)}
                  </span>
                  <span class="text-sm text-red-800">{error}</span>
                </article>
              </section>
            </div>

            <button onClick={handle_remove_file}>
              <figure class="w-6 h-6 cursor-pointer">
                <img
                  src="/icons/trash-outline.svg"
                  alt="You can remove the audio selected previously"
                />
              </figure>
            </button>
          </div>
        </Show>
        <div class="flex w-full justify-center gap-4">
          <button
            class="bg-summarify-dark hover:bg-summarify-light text-white mt-4 p-2 w-64 rounded-md cursor-pointer"
            onClick={handle_summarize}
          >
            <Show when={loading()} fallback="Summarize">
              <LoadingSpinner />
            </Show>
          </button>
          <button
            class="text-gray-800 bg-slate-200 mt-4 p-2 w-64 shadow-xs rounded-md cursor-pointer"
            onClick={handle_clean}
          >
            Clean
          </button>
        </div>
      </section>
      <section class="container mx-auto max-w-6xl px-3 md:px-0">
        <div class="flex flex-col md:flex-row gap-0 md:gap-4 mt-8 mb-8">
          <section class="flex flex-col flex-1 order-2 md:order-1">
            <header class="flex justify-between items-end p-2">
              <h3 class="text-md font-bold">
                Transcribe Audio{' '}
                <span class="text-xs font-semibold text-slate-600">
                  ✪ Powered by Whisper AI
                </span>
              </h3>
              <Show when={summary()?.transcribe}>
                <button onClick={() => handle_copy(summary()?.transcribe)}>
                  <figure class="w-4 h-4">
                    <img
                      src="/icons/copy-outline.svg"
                      alt="Icon to copy the audio transcribed"
                    />
                  </figure>
                </button>
              </Show>
            </header>

            <Show when={!loading()} fallback={<LoadingSpinner />}>
              <Show when={summary()?.transcribe}>
                <code class="rounded-lg border-2 border-dashed border-gray-300 p-4">
                  {summary()?.transcribe}
                </code>
              </Show>
            </Show>
          </section>
          <section class="flex flex-col flex-1 order-1 md:order-2">
            <header class="flex justify-between items-end p-2">
              <h3 class="text-md font-bold">
                Summary Audio{' '}
                <span class="text-xs font-semibold text-slate-600">
                  ✪ Powered by Cohere AI
                </span>
              </h3>
              <Show when={summary()?.summary}>
                <button onClick={() => handle_copy(summary()?.summary)}>
                  <figure class="w-4 h-4">
                    <img
                      src="/icons/copy-outline.svg"
                      alt="Icon to copy the audio transcribed"
                    />
                  </figure>
                </button>
              </Show>
            </header>
            <Show when={summary()?.summary}>
              <code class="rounded-lg border-2 border-dashed border-gray-300 p-4">
                {summary()?.summary}
              </code>
            </Show>
          </section>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Summarize;
