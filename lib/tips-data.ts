export interface RiskTip {
  level: number;
  tipNumber: number;
  title: string;
  content: string;
}

export const riskTips: RiskTip[] = [
  // Level 1 - Beginner (21 tips)
  { level: 1, tipNumber: 1, title: "Understanding Risk", content: "Every trade carries risk. Never invest more than you can afford to lose. Grid bots automate trading but don't eliminate risk—they manage it within defined parameters." },
  { level: 1, tipNumber: 2, title: "Position Sizing Basics", content: "Start with 1-5% of your portfolio per grid bot. This limits damage if the market moves against your range. Multiple small positions beat one large bet." },
  { level: 1, tipNumber: 3, title: "What Are Grid Ranges", content: "Grid bots trade within upper and lower price boundaries. If price exits the range, the bot stops trading. Choose ranges based on historical support/resistance levels." },
  { level: 1, tipNumber: 4, title: "Stop Loss Importance", content: "Consider setting a stop loss below your grid's lower bound. If price breaks down significantly, you limit losses rather than holding a depreciating asset." },
  { level: 1, tipNumber: 5, title: "Diversification Principle", content: "Don't run all bots on correlated pairs. BTC and ETH often move together. Mix uncorrelated assets to reduce portfolio-wide drawdowns during market moves." },
  { level: 1, tipNumber: 6, title: "Grid Bot Basics", content: "Grid bots place buy orders below current price and sell orders above. They profit from price oscillation. Best suited for ranging, sideways markets—not trending ones." },
  { level: 1, tipNumber: 7, title: "When To Use Grid Bots", content: "Deploy grid bots in consolidating markets with clear support and resistance. Avoid during major news events or breakouts when price may trend strongly in one direction." },
  { level: 1, tipNumber: 8, title: "Market Conditions Matter", content: "Grid bots thrive in 10-30% range volatility. Too narrow means few trades; too wide means capital inefficiency. Match your grid width to recent price action." },
  { level: 1, tipNumber: 9, title: "Fee Awareness", content: "Trading fees eat into profits. Each grid trade incurs maker/taker fees. Ensure your grid spacing exceeds fees—typically 0.5%+ per grid level minimum." },
  { level: 1, tipNumber: 10, title: "Start Small, Learn Fast", content: "Begin with minimum investment to understand bot behavior. Watch how it handles volatility before scaling up. Experience teaches more than theory." },
  { level: 1, tipNumber: 11, title: "Understand Unrealized P&L", content: "Unrealized P&L fluctuates with price. Don't panic over negative unrealized—grid bots need time and oscillation. Focus on realized arbitrage profits over time." },
  { level: 1, tipNumber: 12, title: "The Power of Patience", content: "Grid bots work best over weeks or months, not days. Let compound arbitrages accumulate. Frequent starting/stopping disrupts strategy effectiveness." },
  { level: 1, tipNumber: 13, title: "Capital Efficiency", content: "More grids require more capital spread thinner. Fewer grids mean larger per-trade profits but fewer opportunities. Balance based on your capital and risk tolerance." },
  { level: 1, tipNumber: 14, title: "Avoid Emotional Trading", content: "Let the bot execute its strategy. Manual intervention often causes more harm than good. Trust your initial analysis unless conditions fundamentally change." },
  { level: 1, tipNumber: 15, title: "Documentation Habit", content: "Record why you created each bot: entry reasoning, expected range, exit conditions. This builds your trading journal and improves future decisions." },
  { level: 1, tipNumber: 16, title: "Understanding APR vs ROI", content: "ROI shows total return. APR annualizes it. A 5% ROI in one week is great (260% APR); the same in one year is modest. Context matters for evaluating performance." },
  { level: 1, tipNumber: 17, title: "Grid Density Trade-offs", content: "More grids = more trades but smaller profits each. Fewer grids = larger moves needed but bigger profits per fill. Neither is universally better." },
  { level: 1, tipNumber: 18, title: "Liquidity Matters", content: "Trade high-volume pairs. Low liquidity means wider spreads and slippage. Stick to major pairs like BTC/USDT, ETH/USDT for reliable execution." },
  { level: 1, tipNumber: 19, title: "Arithmetic vs Geometric", content: "Arithmetic grids have equal price spacing. Geometric grids have equal percentage spacing—better for volatile assets with large price ranges." },
  { level: 1, tipNumber: 20, title: "Know Your Exit Strategy", content: "Decide in advance: when will you stop the bot? At a profit target? If price exits range? Having exit rules prevents emotional decisions." },
  { level: 1, tipNumber: 21, title: "Weekend Considerations", content: "Crypto trades 24/7 but liquidity drops on weekends. Wider spreads may affect bot performance. Some traders pause bots Friday night to Monday morning." },

  // Level 2 - Intermediate (21 tips)
  { level: 2, tipNumber: 1, title: "Advanced Position Sizing", content: "Use the Kelly Criterion modified for crypto: bet fraction = (win_rate × avg_win - (1-win_rate) × avg_loss) / avg_win. Conservative traders use half-Kelly." },
  { level: 2, tipNumber: 2, title: "Leverage Management", content: "Spot grid bots don't use leverage—that's their safety. Never be tempted to add leverage thinking it will multiply gains. It multiplies liquidation risk too." },
  { level: 2, tipNumber: 3, title: "Market Regime Analysis", content: "Identify market regimes: accumulation, markup, distribution, markdown. Grid bots excel in accumulation and distribution phases. Avoid during markup/markdown trends." },
  { level: 2, tipNumber: 4, title: "Grid Spacing Strategies", content: "Tighter grids near current price capture frequent small moves. Wider grids at extremes catch rare large swings. Hybrid spacing optimizes capital deployment." },
  { level: 2, tipNumber: 5, title: "Multi-Bot Management", content: "Run bots on different timeframes: tight grid for daily noise, wide grid for weekly swings. Diversify strategy, not just assets." },
  { level: 2, tipNumber: 6, title: "Correlation Awareness", content: "Track correlation coefficients between your bot pairs. BTC/USDT and ETH/USDT might have 0.85 correlation—they're not truly diversified. Add uncorrelated assets." },
  { level: 2, tipNumber: 7, title: "Volatility-Based Sizing", content: "Higher volatility = wider grids but smaller position size. Use ATR (Average True Range) to calibrate. 2x ATR volatility deserves 0.5x position size." },
  { level: 2, tipNumber: 8, title: "Rebalancing Triggers", content: "If a bot's allocation grows to 2x its original share of portfolio, consider taking profits. Prevents single-bot concentration risk." },
  { level: 2, tipNumber: 9, title: "Fee Optimization", content: "Use limit orders for maker fees when possible. Some exchanges offer fee discounts for native token holdings. Small optimizations compound over hundreds of trades." },
  { level: 2, tipNumber: 10, title: "Drawdown Limits", content: "Set personal drawdown limits: 10% bot-level, 20% portfolio-level. If hit, stop and reassess. Preserving capital enables future opportunities." },
  { level: 2, tipNumber: 11, title: "Volume Profile Analysis", content: "Study volume at price levels. High-volume zones indicate strong support/resistance—good grid boundaries. Low-volume areas may see fast price moves through." },
  { level: 2, tipNumber: 12, title: "News Event Preparation", content: "Before major events (FOMC, earnings, upgrades), either tighten stop losses or pause bots. News can break ranges violently. Resume after volatility settles." },
  { level: 2, tipNumber: 13, title: "Opportunity Cost", content: "Capital in a stagnant bot can't capture opportunities elsewhere. If a bot hasn't traded in 2+ weeks, evaluate if that capital is better deployed." },
  { level: 2, tipNumber: 14, title: "Risk/Reward Ratios", content: "Your grid range defines max loss (price going to zero) and expected gain (total arbitrage potential). Ensure asymmetric upside before deploying." },
  { level: 2, tipNumber: 15, title: "Compounding Returns", content: "Reinvest realized profits by increasing grid investment. But don't auto-compound—wait for opportune moments when range conditions are ideal." },
  { level: 2, tipNumber: 16, title: "Slippage Management", content: "In fast markets, your orders may fill at worse prices. Wider grids absorb slippage better. Monitor fill quality and adjust spacing if needed." },
  { level: 2, tipNumber: 17, title: "Multiple Timeframe Analysis", content: "Daily chart shows trend, 4H shows range, 1H shows entries. Set grid range on higher timeframe, optimize grid count on lower timeframe." },
  { level: 2, tipNumber: 18, title: "Partial Position Exits", content: "If price approaches range boundary, consider manually closing 50% of position. If it reverses, you profit. If it breaks out, you limited loss." },
  { level: 2, tipNumber: 19, title: "Exchange Diversification", content: "Don't run all bots on one exchange. Exchange hacks, outages, or freezes happen. Spread across 2-3 trusted platforms for operational safety." },
  { level: 2, tipNumber: 20, title: "Performance Attribution", content: "Track which bots contribute most to returns. Allocate more to consistently profitable strategies. Cut underperformers faster than you scale winners." },
  { level: 2, tipNumber: 21, title: "Hedging Strategies", content: "Consider small put options or short perpetuals as insurance against grid bot portfolios. Costs premium but caps maximum loss during black swan events." },

  // Level 3 - Advanced (21 tips)
  { level: 3, tipNumber: 1, title: "Modern Portfolio Theory", content: "Optimize bot allocation using mean-variance analysis. The efficient frontier shows maximum return per unit of risk. Grid bots can be treated as assets with their own return/volatility profiles." },
  { level: 3, tipNumber: 2, title: "Correlation Dynamics", content: "Correlations increase during market stress (correlation breakdown). Your 'diversified' bots may all lose together in crashes. Account for tail correlation in risk models." },
  { level: 3, tipNumber: 3, title: "Value at Risk (VaR)", content: "Calculate portfolio VaR: the maximum expected loss at a confidence level (e.g., 95% VaR = loss exceeded only 5% of days). Size total grid exposure to acceptable VaR." },
  { level: 3, tipNumber: 4, title: "Conditional VaR (CVaR)", content: "VaR doesn't capture tail severity. CVaR (Expected Shortfall) averages losses beyond VaR. For crypto, CVaR may be 2-3x VaR. Use it for stress testing." },
  { level: 3, tipNumber: 5, title: "Psychological Capital", content: "Every trader has finite emotional bandwidth. A string of losses depletes it even if capital survives. Size positions so drawdowns don't affect decision-making quality." },
  { level: 3, tipNumber: 6, title: "Regime Switching Models", content: "Markets alternate between low and high volatility regimes. Use Markov models or simple volatility rules to adjust grid parameters when regimes change." },
  { level: 3, tipNumber: 7, title: "Market Making Concepts", content: "Grid bots are simplified market makers. Understand bid-ask spread dynamics, inventory risk, and adverse selection. You profit from noise traders, lose to informed ones." },
  { level: 3, tipNumber: 8, title: "Liquidity Provisioning", content: "Your grid orders add liquidity to order books. In return, you capture the spread. But toxic flow (informed traders) can consistently hit your orders adversely." },
  { level: 3, tipNumber: 9, title: "Gamma Trading", content: "Grid bots have positive gamma—they buy more as price falls, sell as it rises. This is valuable in ranging markets but costly in trending ones. Match gamma exposure to market view." },
  { level: 3, tipNumber: 10, title: "Mean Reversion Statistics", content: "Quantify mean reversion using half-life metrics. If a pair's deviations typically revert in 3 days, size grids for 3-5 day holding periods. Longer half-life = wider grids." },
  { level: 3, tipNumber: 11, title: "Cointegration Trading", content: "Some pairs maintain long-term price relationships (cointegration). BTC/ETH ratio may mean-revert even when both trend. Consider ratio-based grids for pairs trading." },
  { level: 3, tipNumber: 12, title: "Kelly Criterion Deeper", content: "Full Kelly maximizes log wealth but has high variance. Fractional Kelly (0.25-0.5x) reduces volatility dramatically while sacrificing little long-term growth. Most pros use fractional." },
  { level: 3, tipNumber: 13, title: "Survivorship Bias", content: "You see successful grid strategies; failed ones disappeared. Historical backtests suffer survivorship bias. Test on delisted pairs, bear markets, and flash crashes too." },
  { level: 3, tipNumber: 14, title: "Execution Quality Metrics", content: "Track fill rates, slippage, and price improvement. If your grids consistently fill at worse prices, you may face informed flow or need better execution algorithms." },
  { level: 3, tipNumber: 15, title: "Black Swan Preparation", content: "Allocate 5-10% of portfolio to tail hedges: deep OTM puts, inverse ETFs, or cash. They drag returns normally but save you in crashes. Insurance mindset." },
  { level: 3, tipNumber: 16, title: "Systematic vs Discretionary", content: "Pure systematic removes emotion but can't adapt to novel situations. Pure discretionary is flexible but inconsistent. Best traders blend: systematic core, discretionary overlay." },
  { level: 3, tipNumber: 17, title: "Strategy Capacity", content: "Every strategy has capacity limits. Grid profits come from noise traders; there are finite noise traders. As your capital grows, alpha per dollar may decrease." },
  { level: 3, tipNumber: 18, title: "Factor Exposure", content: "Understand your exposure to factors: market beta, momentum, volatility. Grid bots are short volatility, long mean-reversion. Know what you're implicitly betting on." },
  { level: 3, tipNumber: 19, title: "Monte Carlo Simulation", content: "Run Monte Carlo simulations on your grid parameters. Generate thousands of price paths to estimate profit distribution, max drawdown, and ruin probability." },
  { level: 3, tipNumber: 20, title: "Risk Parity Allocation", content: "Allocate to bots based on risk contribution, not capital. A volatile pair should get less capital so its risk contribution equals a stable pair's. Equalizes diversification benefit." },
  { level: 3, tipNumber: 21, title: "Meta-Strategy Thinking", content: "The best traders optimize their process, not just positions. Track decision quality separate from outcomes. Good process with bad luck beats bad process with good luck long-term." }
];

export function getTipOfTheWeek(level: number): RiskTip | null {
  const levelTips = riskTips?.filter(t => t?.level === level) ?? [];
  if (levelTips?.length === 0) return null;
  
  // Get week number of the year
  const now = new Date();
  const start = new Date(now?.getFullYear?.() ?? 2026, 0, 1);
  const diff = (now?.getTime?.() ?? 0) - (start?.getTime?.() ?? 0);
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek);
  
  // Rotate through tips based on week number
  const tipIndex = weekNumber % (levelTips?.length ?? 1);
  return levelTips?.[tipIndex] ?? null;
}

export function getTipsByLevel(level: number): RiskTip[] {
  return riskTips?.filter(t => t?.level === level) ?? [];
}
