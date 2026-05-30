import streamlit as st
import pandas as pd
import plotly.express as px
import os
import tempfile


# ── Page config — MUST be first Streamlit call ────────────────────────
st.set_page_config(
    page_title="Meshloop — AI Data Insights",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── Custom CSS ───────────────────────────────────────────────────────
# ── Custom CSS ───────────────────────────────────────────────────────
st.html("""
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* Font overrides */
html, body, [class*="css"], .stMarkdown {
    font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Remove top padding */
.block-container { padding-top: 1.5rem; }

/* Custom tab styles - fix clipping */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px;
    padding-bottom: 4px;
}
.stTabs [data-baseweb="tab"] {
    background-color: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px 8px 0px 0px;
    padding: 10px 16px;
    font-weight: 600;
    color: #94a3b8;
    transition: all 0.2s ease-in-out;
}
.stTabs [aria-selected="true"] {
    background-color: #1e3a5f !important;
    border-color: #3b82f6 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Top Insight card styling - premium dark gradient */
.top-insight-card {
    background: linear-gradient(135deg, #1e3a5f 0%, #064e3b 100%);
    border-radius: 14px;
    padding: 1.5rem 1.75rem;
    color: #ffffff;
    margin: 1rem 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border: 1px solid #1e40af;
}
.top-insight-title {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
}
.top-insight-desc {
    font-size: 0.95rem;
    opacity: 0.95;
    line-height: 1.6;
}

/* Custom cards for findings - dark style */
.insight-card {
    background: #111827;
    border-radius: 12px;
    border-left: 5px solid #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 1.25rem 1.5rem;
    margin: 0.8rem 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-top: 1px solid #1f2937;
    border-right: 1px solid #1f2937;
    border-bottom: 1px solid #1f2937;
}
.insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.insight-card.critical {
    border-left: 5px solid #ef4444;
    background: linear-gradient(to right, #1f1315, #111827);
    border-top: 1px solid #7f1d1d;
    border-right: 1px solid #7f1d1d;
    border-bottom: 1px solid #7f1d1d;
}
.insight-card.high {
    border-left: 5px solid #f97316;
    background: linear-gradient(to right, #24140d, #111827);
    border-top: 1px solid #7c2d12;
    border-right: 1px solid #7c2d12;
    border-bottom: 1px solid #7c2d12;
}
.insight-card.medium {
    border-left: 5px solid #eab308;
    background: linear-gradient(to right, #221a0f, #111827);
    border-top: 1px solid #713f12;
    border-right: 1px solid #713f12;
    border-bottom: 1px solid #713f12;
}
.insight-card.low {
    border-left: 5px solid #22c55e;
    background: linear-gradient(to right, #0c1c15, #111827);
    border-top: 1px solid #064e3b;
    border-right: 1px solid #064e3b;
    border-bottom: 1px solid #064e3b;
}

.insight-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    flex-wrap: wrap;
    gap: 8px;
}
.insight-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f8fafc;
}
.severity-tag {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.25rem 0.60rem;
    border-radius: 20px;
    letter-spacing: 0.5px;
}
.severity-tag.critical { background-color: #7f1d1d; color: #fecaca; }
.severity-tag.high { background-color: #7c2d12; color: #ffedd5; }
.severity-tag.medium { background-color: #713f12; color: #fef9c3; }
.severity-tag.low { background-color: #064e3b; color: #dcfce7; }

.insight-desc {
    font-size: 0.95rem;
    color: #cbd5e1;
    line-height: 1.6;
}
.insight-evidence {
    margin-top: 0.8rem;
    padding-top: 0.6rem;
    border-top: 1px dashed #334155;
    font-size: 0.85rem;
    color: #94a3b8;
}

/* Chat bubble styling - dark */
.chat-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 1.5rem;
}
.chat-user-msg {
    align-self: flex-end;
    background-color: #1e3a5f;
    color: #ffffff;
    border-radius: 16px 16px 4px 16px;
    padding: 0.75rem 1.25rem;
    max-width: 80%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 0.95rem;
    border: 1px solid #1e40af;
}
.chat-bot-msg {
    align-self: flex-start;
    background-color: #111827;
    border-left: 4px solid #3b82f6;
    border-radius: 4px 16px 16px 16px;
    padding: 0.75rem 1.25rem;
    max-width: 85%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-top: 1px solid #1f2937;
    border-right: 1px solid #1f2937;
    border-bottom: 1px solid #1f2937;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #f1f5f9;
}
.source-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 0.6rem;
    border-top: 1px solid #1f2937;
    padding-top: 0.4rem;
}
.source-badge {
    background-color: #1f2937;
    color: #3b82f6;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}
</style>
""")


# ── Session state ─────────────────────────────────────────────────────
for key, default in [
    ("result", None),
    ("chat_history", []),
    ("session_id", None),
    ("loading", False),
]:
    if key not in st.session_state:
        st.session_state[key] = default


# ── SIDEBAR ───────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🔍 Meshloop")
    st.caption("*Powered by GitHub Models (GPT-4o) + Semantic Kernel*")
    st.divider()
    
    st.markdown("### Upload Data")
    uploaded = st.file_uploader(
        "Drop one or more files here",
        type=["csv", "xlsx", "xls", "pdf", "json", "txt", "zip"],
        accept_multiple_files=True,
        help="CSV, Excel, PDF, JSON, TXT, or ZIP containing multiple files",
        label_visibility="collapsed",
    )
    
    if uploaded:
        if isinstance(uploaded, list):
            file_names = [f.name for f in uploaded]
            st.success(f"✅ {len(uploaded)} files selected")
            st.caption(", ".join(file_names[:3]) + ("..." if len(file_names) > 3 else ""))
        else:
            st.success(f"✅ **{uploaded.name}**")
            st.caption(f"{uploaded.size / 1024:.1f} KB")

        if st.button("🚀 Analyze", use_container_width=True, type="primary"):
            st.session_state.loading = True
            st.session_state._uploaded_files = uploaded
            st.rerun()
    
    # Quick sample button
    st.divider()
    if st.button("📊 Try Sample Data", use_container_width=True):
        st.session_state.loading = True
        st.session_state._use_sample = True
        st.rerun()
    
    st.divider()
    st.markdown("**How it works**")
    st.markdown("1. 📂 Upload any data file")
    st.markdown("2. 🤖 AI cleans it automatically")
    st.markdown("3. 💡 Finds hidden patterns")
    st.markdown("4. 💬 Chat with your data")
    st.divider()
    st.caption("🏆 **Microsoft Build AI Hackathon 2026**")
    st.caption("🛡️ *Powered by GitHub Models (GPT-4o) + Semantic Kernel*")
    st.markdown(
        """
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin: 8px 0;">
            <a href="https://github.com/marketplace/models" target="_blank"><img src="https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white" alt="GitHub Models"></a>
            <a href="https://github.com/microsoft/semantic-kernel" target="_blank"><img src="https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white" alt="Semantic Kernel"></a>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.divider()
    st.markdown("🔗 [GitHub Repository](https://github.com/manasdutta04/meshloop)")
    st.markdown("🌐 [Live Demo](https://datanarator.streamlit.app)")


# ── LOADING STATE ─────────────────────────────────────────────────────
if st.session_state.loading:
    st.markdown("### 🔄 Analyzing your data...")
    prog = st.progress(0)
    status = st.empty()
    
    try:
        from pipeline import run_pipeline
        
        # Determine file path
        use_sample = getattr(st.session_state, "_use_sample", False)
        if use_sample:
            sample_zip = "sample_data/arca_test_dataset.zip"
            sample_csv = "sample_data/messy_sales.csv"
            if os.path.exists(sample_zip):
                file_path = sample_zip
            elif os.path.exists(sample_csv):
                file_path = sample_csv
            else:
                st.error("Sample file not found. Please upload a file instead.")
                st.session_state.loading = False
                st.rerun()
            status.text("📂 Loading sample data...")
        else:
            uploaded_files = st.session_state.get("_uploaded_files")
            if not uploaded_files:
                st.error("Please upload a file first.")
                st.session_state.loading = False
                st.rerun()
            if not isinstance(uploaded_files, list):
                uploaded_files = [uploaded_files]

            if len(uploaded_files) == 1 and uploaded_files[0].name.lower().endswith(".zip"):
                with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
                    tmp.write(uploaded_files[0].getvalue())
                    file_path = tmp.name
            else:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp_zip:
                    import zipfile
                    with zipfile.ZipFile(tmp_zip, mode="w") as zf:
                        for uf in uploaded_files:
                            file_bytes = uf.getvalue()
                            zf.writestr(uf.name, file_bytes)
                    file_path = tmp_zip.name
            status.text("📂 Reading uploaded files...")

        # Define progress callback
        def update_progress(percent, msg):
            prog.progress(percent)
            status.text(msg)
            
        result = run_pipeline(file_path, progress_callback=update_progress)
        
        st.session_state.result = result
        st.session_state.session_id = result["session_id"]
        st.session_state.loading = False
        if hasattr(st.session_state, "_use_sample"):
            del st.session_state._use_sample
        
        # Clean up temp file
        if not use_sample and os.path.exists(file_path):
            os.unlink(file_path)
        
        st.rerun()
    
    except Exception as e:
        msg = str(e)
        if "too many requests" in msg.lower() or "rate limit" in msg.lower():
            st.error("❌ Analysis failed: LLM rate limits reached. Please try again in a minute or use smaller sample files.")
            st.caption("Tip: Click 'Try Sample Data' or wait a short while before retrying.")
        else:
            st.error(f"❌ Analysis failed: {msg}")
            st.caption("Check that your file is not empty and is a supported format.")
        st.session_state.loading = False
        if hasattr(st.session_state, "_use_sample"):
            del st.session_state._use_sample


# ── LANDING STATE ─────────────────────────────────────────────────────
elif st.session_state.result is None:
    st.markdown("# 🔍 Meshloop")
    st.markdown("### Turn any messy data file into clear, actionable insights.")
    st.markdown("---")
    
    c1, c2, c3 = st.columns(3)
    c1.info("**📊 Auto-cleans data**\nFixes nulls, wrong types, duplicates — no config needed.")
    c2.info("**💡 Proactive discovery**\nFinds patterns you never knew to look for.")
    c3.info("**💬 Chat with your data**\nAsk questions in plain English, get specific answers.")
    
    st.markdown("---")
    st.markdown("**Supported files:** CSV · Excel · PDF · JSON · TXT · ZIP")
    st.markdown("**Powered by:** GitHub Models (GPT-4o) · Microsoft Phi-4 · Semantic Kernel")


# ── RESULTS STATE ─────────────────────────────────────────────────────
else:
    r = st.session_state.result
    disc = r["discovery"]
    cln  = r["cleaning"]
    ing  = r["ingestion"]
    rep  = r["report"]
    ds   = r["data_summary"]


    tab_ins, tab_charts, tab_chat, tab_report = st.tabs([
        "🔍 Root-Cause Discoveries",
        "📊 Visual Analytics",
        "💬 Incident Room Chat",
        "📋 Audit Report"
    ])

    # ─────────────────────────────────────────────────────────────────
    # TAB 1 — INSIGHTS
    # ─────────────────────────────────────────────────────────────────
    with tab_ins:
        st.markdown(f"#### Analysis: `{ds['file_name']}`")
        
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Rows analyzed",   f"{ds['row_count']:,}")
        m2.metric("Columns",         len(ds["column_names"]))
        m3.metric("Issues cleaned",  len(cln.get("issues_found", [])))
        m4.metric("Insights found",  disc["total_found"])
        
        st.divider()
        st.markdown("#### 📝 Executive Summary")
        st.info(disc.get("summary", "Analysis complete."))
        
        top = disc.get("top_insight", {})
        if top:
            st.markdown("#### 🏆 Top Discovery")
            st.markdown(
                f'<div class="top-insight-card">'
                f'<div class="top-insight-title">🔎 {top.get("title","")}</div>'
                f'<div class="top-insight-desc">{top.get("description","")}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )
        
        st.markdown(f"#### 💡 Discovered Incidents & Findings ({disc['total_found']} found)")
        for i, ins in enumerate(disc.get("insights", [])):
            sev = ins.get("severity", "low").lower()
            title = ins.get("title", f"Insight {i+1}")
            desc = ins.get("description", "")
            ev = ins.get("data_evidence", {})
            
            ev_str = ""
            if ev:
                ev_str = f'<div class="insight-evidence"><b>Evidence:</b> {ev}</div>'
                
            sev_icon = {"critical": "🚨", "high": "🔴", "medium": "🟡", "low": "🟢"}.get(sev, "⚪")
            
            st.markdown(
                f"""
                <div class="insight-card {sev}">
                    <div class="insight-header">
                        <span class="insight-title">{sev_icon} {title}</span>
                        <span class="severity-tag {sev}">{sev}</span>
                    </div>
                    <div class="insight-desc">{desc}</div>
                    {ev_str}
                </div>
                """,
                unsafe_allow_html=True
            )
        
        if cln.get("issues_found"):
            st.divider()
            st.markdown("#### 🧹 Data Quality Fixes Applied")
            for fix in cln["issues_found"]:
                st.markdown(f"- ✅ {fix}")

        # Download cleaned/balanced output
        cleaned_dfs = cln.get("cleaned_dfs", {})
        balanced_dfs = cln.get("balanced_dfs", {})
        if cleaned_dfs:
            st.divider()
            st.markdown("#### 💾 Export Processed Data")
            for filename, df_clean_tab in cleaned_dfs.items():
                if df_clean_tab is not None and len(df_clean_tab) > 0:
                    base_name = os.path.splitext(filename)[0]
                    cleaned_csv = df_clean_tab.to_csv(index=False).encode("utf-8")
                    st.download_button(
                        f"📥 Download cleaned CSV ({filename})",
                        data=cleaned_csv,
                        file_name=f"cleaned_{base_name}.csv",
                        mime="text/csv",
                        key=f"dl_clean_{filename}"
                    )

                    balanced_df = balanced_dfs.get(filename)
                    if balanced_df is not None:
                        balanced_csv = balanced_df.to_csv(index=False).encode("utf-8")
                        st.download_button(
                            f"📥 Download balanced CSV ({filename})",
                            data=balanced_csv,
                            file_name=f"balanced_{base_name}.csv",
                            mime="text/csv",
                            key=f"dl_bal_{filename}"
                        )
                        br = cln.get("cleaning_reports", {}).get(filename, {}).get("balance_report", {})
                        if br:
                            st.caption(
                                f"Balanced on '{br.get('balanced_on')}'. "
                                f"Original counts: {br.get('original_counts')}"
                            )


    # ─────────────────────────────────────────────────────────────────
    # TAB 2 — CHARTS
    # ─────────────────────────────────────────────────────────────────
    with tab_charts:
        cleaned_dfs = cln.get("cleaned_dfs", {})
        df_clean = next(iter(cleaned_dfs.values())) if cleaned_dfs else None
        specs = rep.get("chart_specs", [])
        
        if df_clean is not None and len(df_clean) > 0:
            st.markdown("### 📊 Auto-Generated Visualizations")
            
            for spec in specs:
                try:
                    t = spec.get("type")
                    if t == "histogram" and spec.get("col") in df_clean.columns:
                        fig = px.histogram(df_clean, x=spec["col"],
                                           title=spec["title"], template="plotly_white")
                        st.plotly_chart(fig, use_container_width=True)
                    
                    elif t == "bar" and spec.get("col") in df_clean.columns:
                        vc = df_clean[spec["col"]].value_counts().head(15).reset_index()
                        vc.columns = ["value", "count"]
                        fig = px.bar(vc, x="value", y="count",
                                     title=spec["title"], template="plotly_white")
                        st.plotly_chart(fig, use_container_width=True)
                    
                    elif t == "scatter" and spec.get("x") in df_clean.columns and spec.get("y") in df_clean.columns:
                        fig = px.scatter(df_clean, x=spec["x"], y=spec["y"],
                                         title=spec["title"], trendline="ols",
                                         template="plotly_white")
                        st.caption(f"Correlation: r = {spec.get('corr', 'N/A')}")
                        st.plotly_chart(fig, use_container_width=True)
                    
                    elif t == "line" and spec.get("x") in df_clean.columns and spec.get("y") in df_clean.columns:
                        df_s = df_clean.sort_values(spec["x"])
                        fig = px.line(df_s, x=spec["x"], y=spec["y"],
                                      title=spec["title"], template="plotly_white")
                        st.plotly_chart(fig, use_container_width=True)
                except Exception as e:
                    st.caption(f"Could not render this chart: {e}")
            
            st.divider()
            st.markdown("#### 🔎 Explore Any Column")
            sel = st.selectbox("Choose a column:", df_clean.columns.tolist())
            if sel:
                if df_clean[sel].dtype in ["float64", "int64"]:
                    fig = px.box(df_clean, y=sel, template="plotly_white",
                                 title=f"Box plot: {sel}")
                    st.plotly_chart(fig, use_container_width=True)
                    st.write(df_clean[sel].describe())
                else:
                    fig = px.pie(df_clean, names=sel, title=f"Distribution: {sel}")
                    st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Charts are available for tabular data (CSV/Excel/JSON). For PDF/text, see the Insights tab.")


    with tab_chat:
        st.markdown("### 💬 Ask Your Data Anything")
        st.caption(f"Chatting about: **{ds['file_name']}**")
        
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        for msg in st.session_state.chat_history:
            role = msg["role"]
            content = msg["content"]
            if role == "user":
                st.markdown(f'<div class="chat-user-msg">🧑 {content}</div>', unsafe_allow_html=True)
            elif role == "assistant":
                sources_html = ""
                if msg.get("sources"):
                    sources = [s for s in msg["sources"] if s]
                    if sources:
                        sources_html = '<div class="source-badges">' + "".join(f'<span class="source-badge">📄 {src}</span>' for src in sources) + '</div>'
                st.markdown(f'<div class="chat-bot-msg">🤖 {content}{sources_html}</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Render follow-up suggestions for the LAST message only
        if st.session_state.chat_history:
            last_msg = st.session_state.chat_history[-1]
            if last_msg["role"] == "assistant" and last_msg.get("suggested_followups"):
                st.markdown("<div style='margin-top: 10px; font-weight: 600; font-size: 0.9rem; color: #475569;'>💡 Suggested follow-up questions:</div>", unsafe_allow_html=True)
                cols = st.columns(len(last_msg["suggested_followups"]))
                for idx, q in enumerate(last_msg["suggested_followups"]):
                    with cols[idx]:
                        if st.button(q, key=f"fu_{idx}", use_container_width=True):
                            _ask(q, ds)
                            st.rerun()
        
        if not st.session_state.chat_history:
            st.markdown("**Try asking:**")
            suggestions = [
                "What is the most important pattern in this data?",
                "Which values look suspicious or unusual?",
                "What should I investigate first?",
                "Summarize the key takeaways.",
            ]
            col_a, col_b = st.columns(2)
            for i, q in enumerate(suggestions):
                with (col_a if i % 2 == 0 else col_b):
                    if st.button(q, key=f"sq_{i}"):
                        _ask(q, ds)
                        st.rerun()
        
        user_q = st.chat_input("Ask anything about your data...")
        if user_q:
            _ask(user_q, ds)
            st.rerun()
        
        if st.session_state.chat_history:
            if st.button("🗑️ Clear chat"):
                st.session_state.chat_history = []
                st.rerun()


    # ─────────────────────────────────────────────────────────────────
    # TAB 4 — REPORT
    # ─────────────────────────────────────────────────────────────────
    with tab_report:
        st.markdown("### 📋 Full Insight Report")
        st.markdown(rep.get("report_text", "No report generated."))
        st.divider()
        st.download_button(
            "📥 Download Report (.md)",
            data=rep.get("report_text", ""),
            file_name=f"meshloop_{ds['file_name']}.md",
            mime="text/markdown",
        )
    
    st.divider()
    if st.button("📂 Analyze a Different File"):
        st.session_state.result = None
        st.session_state.chat_history = []
        st.session_state.session_id = None
        st.session_state._uploaded_files = None
        st.rerun()


# ── Helper: handle a chat question ───────────────────────────────────
def _ask(question: str, data_summary: dict):
    st.session_state.chat_history.append({"role": "user", "content": question})
    with st.spinner("Thinking..."):
        from agents.chat import answer_question
        resp = answer_question(question, st.session_state.session_id, data_summary)
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": resp["answer"],
        "sources": resp.get("sources", []),
        "suggested_followups": resp.get("suggested_followups", [])
    })
