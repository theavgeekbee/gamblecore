import Link from "next/link";

export default function Landing() {
    return <main>
        <h1>SigmaTerminal</h1>
        <h2>Rizz First / Then Griddy</h2>
        <p>This is the landing page.</p>
        <Link href={"/"}>Go to the REAL page.</Link>
    </main>;
}