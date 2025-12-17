import { login } from './actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-sm shadow-md w-full max-w-md border-t-4 border-bbro-element-dark">
                <h1 className="text-2xl font-bold text-center mb-6 text-bbro-element-dark">AREA RISERVATA</h1>

                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full p-3 border border-gray-300 rounded-sm focus:border-bbro-element-light focus:outline-none"
                            placeholder="admin@bbro.it"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-3 border border-gray-300 rounded-sm focus:border-bbro-element-light focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        formAction={login}
                        className="mt-4 bg-bbro-element-dark text-white p-3 rounded-sm font-bold uppercase tracking-widest hover:bg-black transition"
                    >
                        Accedi
                    </button>
                </form>
            </div>
        </div>
    )
}
