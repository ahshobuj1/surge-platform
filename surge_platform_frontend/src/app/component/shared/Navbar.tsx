import Link from "next/link";

function Navbar() {
    return ( <>
        <div className="flex items-center justify-between bg-blue-400">
            <h1 className="px-4 py-2">Surge</h1>
            <div className="flex items-center gap-4">
                <Link href={'/login'}>Login</Link>
                <Link href={'/signup'}>Signup</Link>
            </div>
        </div>
    </> );
}

export default Navbar;