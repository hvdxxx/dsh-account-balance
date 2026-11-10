window.__ModuleLoader__.load({
	id: "dsh-account-balance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let react = require("react");
		//#region copy
		/** Locale namespace owned by this plugin. */
		const NS = "accountBalance";
		/** Simplified Chinese copy (baseline locale). */
		const zh = {
			"label": "余额",
			"loading": "…",
			"unavailable": "不可用",
			"refreshHint": "点击刷新余额",
			"bonusHint": "赠送"
		};
		/** English copy (fallback for every other language). */
		const en = {
			"label": "Balance",
			"loading": "…",
			"unavailable": "unavailable",
			"refreshHint": "Click to refresh the balance",
			"bonusHint": "Granted"
		};
		/** Japanese copy. */
		const ja = {
			"label": "残高",
			"loading": "…",
			"unavailable": "利用できません",
			"refreshHint": "クリックして残高を更新",
			"bonusHint": "付与分"
		};
		/** Spanish copy. */
		const es = {
			"label": "Saldo",
			"loading": "…",
			"unavailable": "no disponible",
			"refreshHint": "Haga clic para actualizar el saldo",
			"bonusHint": "Bonificado"
		};
		/** French copy. */
		const fr = {
			"label": "Solde",
			"loading": "…",
			"unavailable": "indisponible",
			"refreshHint": "Cliquez pour actualiser le solde",
			"bonusHint": "Offert"
		};
		/** German copy. */
		const de = {
			"label": "Guthaben",
			"loading": "…",
			"unavailable": "nicht verfügbar",
			"refreshHint": "Klicken, um das Guthaben zu aktualisieren",
			"bonusHint": "Gutgeschrieben"
		};
		/** Russian copy. */
		const ru = {
			"label": "Баланс",
			"loading": "…",
			"unavailable": "недоступен",
			"refreshHint": "Нажмите, чтобы обновить баланс",
			"bonusHint": "Бонус"
		};
		/** Portuguese copy. */
		const pt = {
			"label": "Saldo",
			"loading": "…",
			"unavailable": "indisponível",
			"refreshHint": "Clique para atualizar o saldo",
			"bonusHint": "Bonificado"
		};
		//#endregion
		//#region styles
		/**
		* Sidebar-foot readout stylesheet. Only theme tokens from the host theme
		* carry color; geometry stays literal so the row lines up with the
		* sidebar's own rows.
		*/
		const CSS = ".dsh-bal-row{box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:2px;flex:1 1 auto;width:auto;min-width:0;margin:0 0 4px;padding:4px 9px 5px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;text-align:start;cursor:pointer}.dsh-bal-row:hover{background:var(--dsw-alias-bg-layer-2)}.dsh-bal-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px}.dsh-bal-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:14px}.dsh-bal-value{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:21px;line-height:27px;font-weight:600;letter-spacing:-0.01em;font-variant-numeric:tabular-nums}";
		//#endregion
		//#region formatting
		/** Currency symbols the Platform reports; unknown codes keep their code. */
		const SYMBOLS = {
			CNY: "¥",
			USD: "$",
			EUR: "€"
		};
		/** How often the readout refreshes itself while the page stays open. */
		const REFRESH_MS = 30000;
		/** Version reported to the Platform when the boot payload carries none. */
		const FALLBACK_VERSION = "0.2.2-rc.1";
		/**
		* Insert thousands separators into a fixed two-decimal amount.
		* @param text - amount without grouping, for example `1250.00`.
		* @returns grouped amount, for example `1,250.00`.
		*/
		function groupDigits(text) {
			const [integer, fraction] = text.split(".");
			const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return fraction === void 0 ? grouped : grouped + "." + fraction;
		}
		/**
		* Format one wallet amount the way the Platform card does: two decimals,
		* `0.00` for an empty wallet, `<0.01` under one cent.
		* @param amount - decimal balance string returned by the Host.
		* @param currency - ISO currency code.
		* @returns display text such as `¥12.34`.
		*/
		function formatAmount(amount, currency) {
			const symbol = SYMBOLS[currency] ?? String(currency) + " ";
			const value = Number(amount);
			if (!Number.isFinite(value)) return symbol + "?";
			if (value === 0) return symbol + "0.00";
			const sign = value < 0 ? "-" : "";
			const magnitude = Math.abs(value);
			if (magnitude < 0.01) return sign + "<" + symbol + "0.01";
			return sign + symbol + groupDigits((Math.floor(magnitude * 100) / 100).toFixed(2));
		}
		/**
		* Join the amounts of one wallet group into `$1.00 + ¥25.00`.
		* @param wallets - wallets with a `balance` string and a `currency` code.
		* @returns display text, or an empty string when there is nothing to show.
		*/
		function formatWallets(wallets) {
			if (!Array.isArray(wallets) || wallets.length === 0) return "";
			return wallets.map((wallet) => formatAmount(wallet.balance, wallet.currency)).join(" + ");
		}
		//#endregion
		//#region component
		/**
		* Sidebar-foot readout: one compact balance line above the account row.
		* @param props - slot owner props (`wide`) plus the injected reader and translator.
		* @returns the readout, or nothing while the sidebar is a rail or no account is signed in.
		*/
		function BalanceRow(props) {
			const { wide, read, t } = props;
			const [state, setState] = react.useState({ phase: "loading" });
			react.useEffect(() => {
				let alive = true;
				/**
				* Apply one read result; a failed silent refresh keeps the last good amount.
				* @param next - the phase the read produced.
				*/
				const commit = (next) => {
					if (!alive) return;
					setState((previous) => next.phase === "failed" && previous.phase === "ready" ? previous : next);
				};
				const load = () => {
					read().then(commit, () => commit({ phase: "failed" }));
				};
				load();
				const timer = window.setInterval(load, REFRESH_MS);
				const onVisible = () => {
					if (document.visibilityState === "visible") load();
				};
				window.addEventListener("focus", load);
				document.addEventListener("visibilitychange", onVisible);
				return () => {
					alive = false;
					window.clearInterval(timer);
					window.removeEventListener("focus", load);
					document.removeEventListener("visibilitychange", onVisible);
				};
			}, [read]);
			if (!wide || state.phase === "hidden") return null;
			const wallets = state.phase === "ready" ? formatWallets(state.wallets) : "";
			const bonus = state.phase === "ready" ? formatWallets(state.bonus) : "";
			const text = state.phase === "ready" ? wallets || bonus || "—" : state.phase === "loading" ? t("loading") : t("unavailable");
			const details = [
				state.phase === "ready" && wallets ? t("label") + ": " + wallets : "",
				state.phase === "ready" && bonus ? t("bonusHint") + ": " + bonus : ""
			].filter((part) => part !== "");
			const hint = details.length === 0 ? t("refreshHint") : details.join(" · ") + " · " + t("refreshHint");
			const reload = () => {
				setState({ phase: "loading" });
				read().then((next) => setState(next), () => setState({ phase: "failed" }));
			};
			return react.createElement("button", {
				type: "button",
				className: "dsh-bal-row",
				title: hint,
				onClick: reload
			}, [
				react.createElement("span", { key: "label", className: "dsh-bal-label" }, t("label")),
				react.createElement("span", { key: "value", className: "dsh-bal-value" }, text)
			]);
		}
		//#endregion
		//#region plugin body
		/** Required Client services: slot registry, locale catalog, account remote and its access gate. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.account",
			"remoteAccess"
		];
		/**
		* Register the balance readout in the sidebar foot.
		* @param ctx - Client plugin context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "account balance: dictionaries");
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-account-balance";
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "account balance: stylesheet");
			/**
			* Build the request identity for one account call.
			* @returns the metadata the account Remote methods carry.
			*/
			const metadata = () => {
				const release = globalThis.__DSH_BOOT__?.release;
				return {
					version: typeof release?.version === "string" && release.version !== "" ? release.version : FALLBACK_VERSION,
					locale: ctx.locale.getSnapshot().active,
					timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60
				};
			};
			/**
			* Read the current balance once.
			* @returns `ready` with wallets, `hidden` when no account holds a balance, or `failed`.
			* @throws Error when the Host reports a failed read.
			*/
			const read = async () => {
				const result = await ctx.remote.account.getBalance(metadata());
				if (!result || result.ok !== true) throw new Error("account balance request failed");
				const value = result.value;
				if (value === null || value === void 0) return { phase: "hidden" };
				if (value.status !== "ready") throw new Error("account balance unavailable");
				return {
					phase: "ready",
					wallets: Array.isArray(value.value) ? value.value : [],
					bonus: Array.isArray(value.bonusWallets) ? value.bonusWallets : []
				};
			};
			ctx.remoteAccess.whenAccess("account/watch", () => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "account-balance",
				order: 5,
				locale: NS,
				inject: () => ({
					read
				})
			}, BalanceRow)));
		}
		//#endregion
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
