import { useState } from "react";
import Image from "next/image";
import { dates } from "@/utils/dates";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [labelError, setLabelError] = useState(false);

  const handleAddTicker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = document.getElementById("ticker-input") as HTMLInputElement;
    const value = input.value.trim();
    if (value.length > 2 && tickers.length < 3) {
      setTickers((prev) => [...prev, value.toUpperCase()]);
      input.value = "";
      setLabelError(false);
    } else {
      setLabelError(true);
    }
  };

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        tickers.map(async (ticker) => {
          const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("API error");
          return res.text();
        })
      );
      setReport(responses.join("\n"));
    } catch (err) {
      setReport("Error fetching data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          margin: "2rem 0 0 0",
        }}
      >
        <Image
          src="/images/logo-dave-text.png"
          alt="Logo"
          width={600}
          height={120}
          style={{
            width: "100%",
            maxWidth: 600,
            height: "auto",
            display: "block",
          }}
        />
      </div>

      <main className={styles.main}>
        {!loading && !report && (
          <section className={styles.actionPanel}>
            <form onSubmit={handleAddTicker} className={styles.form}>
              <label
                htmlFor="ticker-input"
                className={
                  styles.label + (labelError ? " " + styles.labelError : "")
                }
              >
                Add up to 3 stock tickers below to get a super accurate stock
                predictions report👇
              </label>
              <div className={styles.formInputControl}>
                <input
                  id="ticker-input"
                  type="text"
                  placeholder="MSFT"
                  className={styles.input}
                />
                <button className={styles.addBtn} type="submit">
                  <Image
                    src="/images/add.svg"
                    alt="Add"
                    className={styles.addSvg}
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </form>

            <p className={styles.tickerDisplay}>
              {tickers.map((ticker, idx) => (
                <span key={idx} className={styles.ticker}>
                  {ticker}
                </span>
              ))}
            </p>

            <button
              className={styles.generateBtn}
              onClick={fetchStockData}
              disabled={tickers.length === 0}
            >
              Generate Report
            </button>
            <p className={styles.tagLine}>Always correct 15% of the time!</p>
          </section>
        )}

        {loading && (
          <section className={styles.loadingPanel}>
            <Image
              src="/images/loader.svg"
              alt="loading"
              width={100}
              height={100}
            />
            <p>Querying Stocks API...</p>
          </section>
        )}

        {report && (
          <section className={styles.outputPanel}>
            <h2 className={styles.outputTitle}>Your Report 😜</h2>
            <p>{report}</p>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        &copy; This is not real financial advice!
      </footer>
    </div>
  );
}
