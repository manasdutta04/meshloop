import streamlit as st
import pandas as pd
import plotly.express as px
import os
import tempfile


# ── Page config — MUST be first Streamlit call ────────────────────────
st.set_page_config(
    page_title="Meshloop",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── Custom CSS ───────────────────────────────────────────────────────
st.markdown("""
<style>
/* Remove top padding */
.block-container { padding-top: 1rem; }


/* Insight card styling */
.top-insight-card {
    background: linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    color: white;
    margin: 0.75rem 0;
}
.top-insight-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
}
.top-insight-desc {
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.6;
}


/* Chat bubbles */
.chat-user {
    background: #f0f2f6;
    border-radius: 12px 12px 4px 12px;
    padding: 0.6rem 1rem;
    margin: 0.3rem 0 0.3rem auto;
    max-width: 80%;
    font-size: 0.95rem;
}
.chat-bot {
    background: #e8f4fd;
    border-left: 4px solid #1e6fa8;
    border-radius: 0 12px 12px 12px;
    padding: 0.6rem 1rem;
    margin: 0.3rem 0;
    max-width: 90%;
    font-size: 0.95rem;
    line-height: 1.6;
}


/* Severity badges */
.badge-critical { color: #c0392b; font-weight: 600; }
.badge-high     { color: #d35400; font-weight: 600; }
.badge-medium   { color: #d4ac0d; font-weight: 600; }
.badge-low      { color: #27ae60; font-weight: 600; }
</style>
""", unsafe_allow_html=True)


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
        "Drop any file here",
        type=["csv", "xlsx", "pdf", "json", "txt"],
        help="CSV, Excel, PDF, JSON, or plain text",
        label_visibility="collapsed",
    )
    
    if uploaded:
        st.success(f"✅ **{uploaded.name}**")
        st.caption(f"{uploaded.size / 1024:.1f} KB")
        
        if st.button("🚀 Analyze", use_container_width=True, type="primary"):
            st.session_state.loading = True
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
    st.caption("Microsoft Build AI Hackathon 2026")
    st.caption("Built with: GitHub Models · Semantic Kernel · Streamlit")


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
            file_path = "sample_data/messy_sales.csv"
            if not os.path.exists(file_path):
                st.error("Sample file not found. Please upload a file instead.")
                st.session_state.loading = False
                st.rerun()
            status.text("📂 Loading sample data...")
        else:
            if uploaded is None:
                st.error("Please upload a file first.")
                st.session_state.loading = False
                st.rerun()
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=f".{uploaded.name.split('.')[-1]}"
            ) as tmp:
                tmp.write(uploaded.getvalue())
                file_path = tmp.name
            status.text("📂 Reading file...")
        
        prog.progress(20)
        status.text("🤖 Running AI agents...")
        
        result = run_pipeline(file_path)
        
        prog.progress(100)
        status.text("✅ Done!")
        
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
        st.error(f"❌ Analysis failed: {str(e)}")
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
    st.markdown("**Supported files:** CSV · Excel · PDF · JSON · TXT")
    st.markdown("**Powered by:** GitHub Models (GPT-4o) · Microsoft Phi-4 · Semantic Kernel")


# ── RESULTS STATE ─────────────────────────────────────────────────────
else:
    r = st.session_state.result
    disc = r["discovery"]
    cln  = r["cleaning"]
    ing  = r["ingestion"]
    rep  = r["report"]
    ds   = r["data_summary"]


    tab_ins, tab_charts, tab_chat, tab_report = st.tabs(
        ["💡 Insights", "📊 Charts", "💬 Chat", "📋 Report"]
    )

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
        
        st.markdown(f"#### 💡 All Insights ({disc['total_found']} found)")
        icons = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}
        for i, ins in enumerate(disc.get("insights", [])):
            icon = icons.get(ins.get("severity", "low"), "⚪")
            with st.expander(f"{icon} {ins.get('title', f'Insight {i+1}')}"):
                st.write(ins.get("description", ""))
                ev = ins.get("data_evidence", {})
                if ev:
                    st.caption(f"Evidence: {ev}")
        
        if cln.get("issues_found"):
            st.divider()
            st.markdown("#### 🧹 Data Quality Fixes Applied")
            for fix in cln["issues_found"]:
                st.markdown(f"- ✅ {fix}")

        # Download cleaned/balanced output
        df_clean_tab = cln.get("cleaned_df")
        if df_clean_tab is not None:
            st.divider()
            st.markdown("#### 💾 Export Processed Data")
            base_name = os.path.splitext(ds["file_name"])[0]
            cleaned_csv = df_clean_tab.to_csv(index=False).encode("utf-8")
            st.download_button(
                "📥 Download cleaned CSV",
                data=cleaned_csv,
                file_name=f"cleaned_{base_name}.csv",
                mime="text/csv",
            )

            balanced_df = cln.get("balanced_df")
            if balanced_df is not None:
                balanced_csv = balanced_df.to_csv(index=False).encode("utf-8")
                st.download_button(
                    "📥 Download balanced CSV",
                    data=balanced_csv,
                    file_name=f"balanced_{base_name}.csv",
                    mime="text/csv",
                )
                br = cln.get("balance_report", {})
                if br:
                    st.caption(
                        f"Balanced on '{br.get('balanced_on')}'. "
                        f"Original counts: {br.get('original_counts')}"
                    )
            else:
                st.caption("No balancing was applied for this dataset.")


    # ─────────────────────────────────────────────────────────────────
    # TAB 2 — CHARTS
    # ─────────────────────────────────────────────────────────────────
    with tab_charts:
        df_clean = cln.get("cleaned_df")
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


    # ─────────────────────────────────────────────────────────────────
    # TAB 3 — CHAT
    # ─────────────────────────────────────────────────────────────────
    with tab_chat:
        st.markdown("### 💬 Ask Your Data Anything")
        st.caption(f"Chatting about: **{ds['file_name']}**")
        
        for msg in st.session_state.chat_history:
            role = msg["role"]
            content = msg["content"]
            if role == "user":
                st.markdown(f'<div class="chat-user">🧑 {content}</div>', unsafe_allow_html=True)
            elif role == "assistant":
                st.markdown(f'<div class="chat-bot">🤖 {content}</div>', unsafe_allow_html=True)
        
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
        st.rerun()


# ── Helper: handle a chat question ───────────────────────────────────
def _ask(question: str, data_summary: dict):
    st.session_state.chat_history.append({"role": "user", "content": question})
    with st.spinner("Thinking..."):
        from agents.chat import answer_question
        resp = answer_question(question, st.session_state.session_id, data_summary)
    st.session_state.chat_history.append({"role": "assistant", "content": resp["answer"]})
