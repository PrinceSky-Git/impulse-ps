import { FS, Utils } from '../../../lib';

const GITHUB_TOKEN = 'your_github_token_here';
const WHITELISTED_USERS = ['princesky', 'musaddiktemkar', 'turborx'];

// Paths that are restricted from write/delete/move operations
const PROTECTED_PATHS = ['config/', 'fullchain.pem', 'privkey.pem'];

const FileManager = {
	isProtected(path: string): boolean {
		return PROTECTED_PATHS.some(p => path.toLowerCase().includes(p.toLowerCase()));
	},

	checkAccess(user: User) {
		if (!WHITELISTED_USERS.includes(user.id)) {
			throw new Chat.ErrorMessage("You are not whitelisted to use file management commands.");
		}
	},

	getError(err: unknown): string {
		return err instanceof Error ? err.message : String(err);
	},

	async collectFiles(dirPath: string, results: string[] = [], extFilter?: string): Promise<string[]> {
		const entries = await FS(dirPath).readdir();
		for (const entry of entries) {
			const fullPath = `${dirPath}/${entry}`;
			if (await FS(fullPath).isDirectory()) {
				await FileManager.collectFiles(fullPath, results, extFilter);
			} else if (!extFilter || entry.endsWith(extFilter)) {
				results.push(fullPath);
			}
		}
		return results;
	},

	async uploadTo0x0(fileName: string, content: string): Promise<string> {
		const blob = new Blob([content], { type: 'text/plain' });
		const form = new FormData();
		form.append('file', blob, fileName);

		const response = await fetch('https://0x0.st', {
			method: 'POST',
			headers: { 'User-Agent': 'Pokemon-Showdown' },
			body: form,
		});
		if (!response.ok) throw new Error(`0x0.st responded with ${response.status}`);
		return (await response.text()).trim();
	},
};

export const commands: Chat.ChatCommands = {
	file: {
		async list(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);

			const dirPath = target.trim() || '.';
			try {
				const dir = FS(dirPath);
				if (!await dir.exists()) throw new Error(`Directory not found: ${dirPath}`);
				if (!await dir.isDirectory()) throw new Error(`Path is not a directory: ${dirPath}`);

				const contents = await dir.readdir();
				const results = {
					directories: [] as string[],
					files: [] as string[],
				};

				for (const item of contents) {
					const itemPath = dirPath === '.' ? item : `${dirPath}/${item}`;
					if (await FS(itemPath).isDirectory()) {
						results.directories.push(`${item}/`);
					} else {
						results.files.push(item);
					}
				}

				let html = `<strong>Listing for: ${Utils.escapeHTML(dirPath)}</strong><hr />`;

				if (results.directories.length) {
					html += `<b>Directories:</b><br />`;
					html += `<code style="color: #2a75bb">${results.directories.join(', ')}</code><br /><br />`;
				}

				if (results.files.length) {
					html += `<b>Files:</b><br />`;
					html += `<code>${results.files.join(', ')}</code>`;
				}

				if (!results.directories.length && !results.files.length) {
					html += `<i>Directory is empty.</i>`;
				}

				this.sendReplyBox(`<div style="max-height: 300px; overflow-y: auto;">${html}</div>`);
			} catch (err) {
				throw new Chat.ErrorMessage(`List failed: ${FileManager.getError(err)}`);
			}
		},

		async read(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			if (!target) return this.parse('/file help');

			const filePath = target.trim();
			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error(`File not found: ${filePath}`);
				if (!await file.isFile()) throw new Error(`Path is not a file: ${filePath}`);

				const content = await file.read();
				this.sendReplyBox(
					`<details><summary>File: ${Utils.escapeHTML(filePath)}</summary>` +
					`<pre style="max-height: 400px; overflow-y: auto;">${Utils.escapeHTML(content)}</pre></details>`
				);
			} catch (err) {
				throw new Chat.ErrorMessage(`Read failed: ${FileManager.getError(err)}`);
			}
		},

		async delete(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const filePath = target.trim();

			if (FileManager.isProtected(filePath)) throw new Chat.ErrorMessage("This file is protected.");

			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error("File does not exist.");
				await file.unlinkIfExists();
				this.sendReply(`File deleted: ${filePath}`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Delete failed: ${FileManager.getError(err)}`);
			}
		},

		async move(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const [source, dest] = target.split(',').map(s => s.trim());
			if (!source || !dest) return this.errorReply("Usage: /file move [source], [dest]");

			if (FileManager.isProtected(source) || FileManager.isProtected(dest)) {
				throw new Chat.ErrorMessage("Protected path restriction.");
			}

			try {
				const sourceFile = FS(source);
				if (!await sourceFile.exists()) throw new Error("Source not found.");
				await sourceFile.rename(FS(dest).path);
				this.sendReply(`Moved: ${source} -> ${dest}`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Move failed: ${FileManager.getError(err)}`);
			}
		},

		async upload(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const filePath = target.trim();

			try {
				const file = FS(filePath);
				if (!await file.exists()) throw new Error("File not found.");
				const content = await file.read();
				const fileName = filePath.split('/').pop() || 'file.txt';

				const response = await fetch('https://api.github.com/gists', {
					method: 'POST',
					headers: {
						'Accept': 'application/vnd.github+json',
						'Authorization': `Bearer ${GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': 'Pokemon-Showdown',
					},
					body: JSON.stringify({
						description: `Upload: ${filePath}`,
						public: false,
						files: { [fileName]: { content } },
					}),
				});

				const result = await response.json();
				if (!response.ok) throw new Error(result.message || response.statusText);

				this.sendReplyBox(
					`<strong>Gist Upload Success!</strong><br />` +
					`File: ${Utils.escapeHTML(filePath)}<br />` +
					`URL: <a href="${result.html_url}" target="_blank">${result.html_url}</a>`
				);
			} catch (err) {
				throw new Chat.ErrorMessage(`Upload failed: ${FileManager.getError(err)}`);
			}
		},

		async save(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);
			const [filePath, url] = target.split(',').map(s => s.trim());
			if (!filePath || !url) return this.errorReply("Usage: /file save [path], [url]");

			if (FileManager.isProtected(filePath)) throw new Chat.ErrorMessage("Cannot overwrite protected paths.");

			try {
				const response = await fetch(url, { headers: { 'User-Agent': 'Pokemon-Showdown' } });
				if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

				const content = await response.text();
				await FS(filePath).write(content);
				this.sendReply(`Saved: ${filePath} (${content.length} bytes)`);
			} catch (err) {
				throw new Chat.ErrorMessage(`Save failed: ${FileManager.getError(err)}`);
			}
		},

		async backup(target, room, user) {
			this.checkCan('bypassall');
			FileManager.checkAccess(user);

			const backupDir = target.trim() || 'impulse/db';
			const isDefault = backupDir === 'impulse/db';
			// Default dir backs up all files; custom dirs only back up .json files
			const extFilter = isDefault ? undefined : '.json';

			this.sendReply(`Starting backup of ${backupDir}${extFilter ? ' (*.json)' : ''}...`);

			let files: string[];
			try {
				const dir = FS(backupDir);
				if (!await dir.exists()) throw new Error(`Directory not found: ${backupDir}`);
				if (!await dir.isDirectory()) throw new Error(`${backupDir} is not a directory.`);
				files = await FileManager.collectFiles(backupDir, [], extFilter);
			} catch (err) {
				throw new Chat.ErrorMessage(`Backup failed: ${FileManager.getError(err)}`);
			}

			if (!files.length) {
				throw new Chat.ErrorMessage(`No ${extFilter ? extFilter + ' ' : ''}files found in ${backupDir}.`);
			}

			const results: { path: string, url: string }[] = [];
			const failed: { path: string, error: string }[] = [];

			for (const filePath of files) {
				try {
					const content = await FS(filePath).read();
					const fileName = filePath.replace(/\//g, '_');
					const url = await FileManager.uploadTo0x0(fileName, content);
					results.push({ path: filePath, url });
				} catch (err) {
					failed.push({ path: filePath, error: FileManager.getError(err) });
				}
			}

			let html = `<strong>Backup of ${Utils.escapeHTML(backupDir)}</strong> — ${results.length} uploaded, ${failed.length} failed<hr />`;

			if (results.length) {
				html += `<b>Uploaded:</b><br />`;
				html += results.map(r =>
					`<small>${Utils.escapeHTML(r.path)}</small> → <a href="${r.url}" target="_blank">${r.url}</a>`
				).join('<br />');
			}

			if (failed.length) {
				html += `<br /><br /><b style="color:red">Failed:</b><br />`;
				html += failed.map(f =>
					`<small>${Utils.escapeHTML(f.path)}: ${Utils.escapeHTML(f.error)}</small>`
				).join('<br />');
			}

			this.sendReplyBox(`<div style="max-height: 400px; overflow-y: auto;">${html}</div>`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>File Management (Whitelisted)</b></center><hr>` +
				`<b>/file list [path]</b>: List all files and directories.<hr>` +
				`<b>/file read [path]</b>: View file content.<hr>` +
				`<b>/file delete [path]</b>: Remove a file.<hr>` +
				`<b>/file move [src], [dest]</b>: Move/Rename.<hr>` +
				`<b>/file upload [path]</b>: Upload to Gist.<hr>` +
				`<b>/file save [path], [url]</b>: Download from URL.<hr>` +
				`<b>/file backup [dir]</b>: Backup files to 0x0.st. Defaults to impulse/db (all files). Custom dirs upload .json files only.`
			);
		},
	},
	filelist: 'file.list',
	fileread: 'file.read',
	filedelete: 'file.delete',
	filemove: 'file.move',
	filecopy: 'file.copy',
	fileupload: 'file.upload',
	filesave: 'file.save',
	filebackup: 'file.backup',
	filehelp: 'file.help',
};
