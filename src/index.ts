/**
 * Minimal plugin entry — the three things most plugins need:
 *   1. A toolbar button (declarative, host renders it)
 *   2. A palette command (user-triggered action)
 *   3. Persistent data via loadData / saveData
 *
 * The SDK is bundled into main.js at build time (see rolldown.config.mjs),
 * so the zip is self-contained — the desktop serves it via the
 * `openclime-plugin://` protocol without any node_modules resolution.
 */
import { OpenClimePlugin } from "@openclime/plugin-sdk";

export default class MyPlugin extends OpenClimePlugin {
	id = "TEMPLATE-REPLACE";
	name = "TEMPLATE-REPLACE";

	async onLoad(): Promise<void> {
		const count = await this.loadData<{ n: number }>("count.json", { n: 0 });

		this.registerToolbarButton({
			id: "my-plugin-count",
			label: `Count: ${count.n}`,
			icon: "hash",
			onClick: async () => {
				const next = count.n + 1;
				count.n = next;
				await this.saveData("count.json", count);
				this.refreshToolbarButtons();
			},
		});

		this.registerPaletteCommand({
			id: "my-plugin-hello",
			title: "My Plugin: Say hello",
			run: async () => {
				await this.app.ui.openModal({
					title: "Hello from My Plugin",
					body: "This modal was opened from a palette command.",
				});
			},
		});
	}
}