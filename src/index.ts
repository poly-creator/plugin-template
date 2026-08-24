/**
 * Minimal plugin entry — the three things most plugins need:
 *   1. A toolbar button (`addToolbarButton` — declarative, the host renders it)
 *   2. A palette command (`addCommand` — user-triggered from the command palette)
 *   3. Persistent data (`loadData()` / `saveData()` — per-plugin JSON storage)
 *
 * Plus a plain-DOM `Modal` subclass, so the demo dialog needs no React.
 *
 * The SDK is bundled into main.js at build time (see rolldown.config.mjs),
 * so the zip is self-contained — the desktop serves it via the
 * `openclime-plugin://` protocol without any node_modules resolution.
 *
 * TODO(template): replace every TEMPLATE-REPLACE (here and in manifest.json).
 */
import { Modal, OpenClimePlugin } from "@openclime/plugin-sdk";
import type { PluginHost } from "@openclime/plugin-sdk";

interface MyData {
	n: number;
}

class HelloModal extends Modal {
	constructor(app: PluginHost, count: number) {
		super({ title: "Hello from TEMPLATE-REPLACE", width: 420 });
		// `app` is `declare`d on the base; assign it after super().
		(this as { app: PluginHost }).app = app;

		const body = document.createElement("p");
		body.textContent = `This dialog was opened from a palette command. The count is ${count}.`;
		this.contentEl.appendChild(body);
	}
}

export default class MyPlugin extends OpenClimePlugin {
	async onload(): Promise<void> {
		const data = (await this.loadData<MyData>()) ?? { n: 0 };

		// Toolbar labels don't live-update; re-registering the same id
		// replaces the button (the host stores buttons by id).
		const registerCountButton = (): void => {
			this.addToolbarButton({
				id: "count",
				label: `Count: ${data.n}`,
				onClick: async () => {
					data.n += 1;
					await this.saveData(data);
					registerCountButton();
				},
			});
		};
		registerCountButton();

		this.addCommand({
			id: "hello",
			title: "TEMPLATE-REPLACE: Say hello",
			action: () => {
				new HelloModal(this.app, data.n).open();
			},
		});
	}
}
