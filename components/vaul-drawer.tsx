"use client";

import { Drawer } from "vaul";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface DrawerProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function VaulDrawer({
  children,
  title = "Drawer Title",
  description = "This is a description of the drawer content.",
  trigger = "Open Drawer",
  open,
  setOpen,
}: DrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      {/* <Drawer.Trigger className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50">
        {trigger}
      </Drawer.Trigger> */}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex  flex-col rounded-t-[10px] bg-white">
          <div className="flex-1 rounded-t-[10px] p-4">
            <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-200" />
            <div className="mx-auto max-w-md">
              <Drawer.Title className="mb-4 font-medium text-zinc-900">
                {title}
              </Drawer.Title>
              <div className="mb-4 text-zinc-600">{description}</div>
              {children}
            </div>
          </div>
          {/* <div className="mt-auto border-t border-zinc-200 bg-zinc-50 p-4">
            <div className="mx-auto flex max-w-md justify-between">
              <button
                onClick={() =>
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Escape" })
                  )
                }
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Close
              </button>
              <a
                href="https://github.com/emilkowalski/vaul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                GitHub →
              </a>
            </div>
          </div> */}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// https://v0.dev/chat/vaul-component-UrYi3AcHDTN?b=b_YqDq6w6RwXy&p=0
// https://v0.dev/chat/uber-like-ride-service-LYTOvbG2Se6?b=b_amRpcNOSfvm&p=0
