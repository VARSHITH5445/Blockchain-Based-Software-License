import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Award
} from 'lucide-react';

const VIVA_QUESTIONS = [
  {
    q: "Why use a Blockchain for software licenses instead of a traditional centralized database?",
    a: "Traditional DRM servers represent a single point of failure (SPOF) and centralized vendor lock-in. If the vendor's activation server goes down or the company ceases operations, legitimate users are locked out. Blockchain guarantees permanent, tamper-proof proof of ownership, verifiable uptime, allows peer-to-peer license transfers/resales with automated creator royalties, and eliminates reliance on opaque centralized databases."
  },
  {
    q: "How does the system prevent software piracy and key sharing across multiple computers?",
    a: "Through on-chain Hardware Node-Locking (Machine Fingerprinting). When a client application activates, it computes a cryptographic Keccak-256 hash of low-level machine hardware attributes (CPU architecture, motherboard UUID, MAC address). The smart contract stores this hash and strictly limits the number of allowed hardware seats (e.g., 1 to 5 machines). If an unauthorized computer attempts to use the license ID, the verification call fails on-chain."
  },
  {
    q: "Does verifying a license cost the user any Gas fees in Ethereum?",
    a: "No! License verification uses Ethereum's 'eth_call' (constant / view function), which runs locally on an Ethereum node or RPC provider. It queries the smart contract state without publishing a transaction to the blockchain, meaning verification is 100% free (0 Gas) and executes in milliseconds."
  },
  {
    q: "How is secondary market resale handled, and how does the original developer get compensated?",
    a: "The smart contract features an automated royalty mechanism (e.g. 5% to 10%). When a customer resells a perpetual license via the smart contract, the contract programmatically splits the incoming payment: the developer's registered vendor address automatically receives the royalty fee, while the remainder is credited to the seller. Simultaneously, previous hardware bindings are wiped to enforce clean transfer."
  },
  {
    q: "What prevents an attacker from generating fake license keys with a keygen?",
    a: "Traditional licenses rely on algorithmic string checks (like mathematical modulus checks), which reverse-engineers can disassemble and write 'keygens' for. In this blockchain architecture, a license is a cryptographic state registered on the Ethereum ledger. A key cannot simply be guessed because validity is checked against the actual state of the smart contract and verified using ECDSA digital signatures."
  },
  {
    q: "How does the system support subscription-based licenses with expirations?",
    a: "Subscription products store an 'expiryTimestamp' on the smart contract. When a license is purchased or renewed, the contract sets 'expiryTimestamp = block.timestamp + duration'. When the client software performs verification, the contract checks 'block.timestamp <= expiryTimestamp'. If the timestamp has passed, the smart contract returns an EXPIRED status, locking the software until renewed."
  },
  {
    q: "Can a software vendor revoke a compromised or pirated license?",
    a: "Yes. The contract implements access-controlled administrative functions ('revokeLicense'). If a license key is leaked publicly, the vendor or platform owner can flag it as REVOKED along with an immutable reason logged on-chain. All future verification attempts by client applications will immediately reject the key."
  },
  {
    q: "What is the difference between this system and standard NFT marketplaces (e.g., OpenSea)?",
    a: "Standard NFTs only represent digital artwork or metadata tokens. ChainLicense integrates specialized digital rights management (DRM) logic: hardware node-locking, seat-count constraints, subscription expiry timestamps, administrative revocation, and offline challenge-response cryptographic proofs specifically engineered for software execution."
  },
  {
    q: "How does the system handle offline or air-gapped computers?",
    a: "Air-gapped verification uses an EIP-712 cryptographic challenge-response protocol. The software generates a challenge nonce containing machine hardware fingerprint and timestamp. The user signs this challenge using their Web3 wallet on an internet-connected device or smartphone. The client software uses standard 'ecrecover' to verify the signature offline against the pre-cached public certificate."
  },
  {
    q: "What consensus mechanism does this architecture rely on?",
    a: "It runs on EVM-compatible chains utilizing Proof-of-Stake (PoS) like Ethereum Mainnet, Sepolia testnet, or Layer-2 rollups like Polygon, Arbitrum, or Optimism, offering fast transaction finality and minimal environmental footprint."
  }
];

export default function AcademicDocs() {
  const [searchViva, setSearchViva] = useState('');
  const [openIdx, setOpenIdx] = useState(0);

  const filteredViva = VIVA_QUESTIONS.filter(v => 
    v.q.toLowerCase().includes(searchViva.toLowerCase()) ||
    v.a.toLowerCase().includes(searchViva.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-2xl border border-cyan-500/20 mb-8 bg-gradient-to-r from-slate-900/90 to-slate-950">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          Academic Course Deliverable
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Project Documentation & Viva Voce Defense Hub
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive project report summary, comparative system analysis, cryptographic security specification, and oral examination questions for university evaluation.
        </p>
      </div>

      {/* Comparative System Analysis Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Comparative Analysis: Traditional vs Blockchain DRM
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Why blockchain transforms software licensing architecture:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Evaluation Parameter</th>
                <th className="py-3 px-3">Traditional Centralized DRM</th>
                <th className="py-3 px-3">Hardware Dongles (USB Keys)</th>
                <th className="py-3 px-3 text-cyan-400 font-bold">Proposed ChainLicense System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Architecture</td>
                <td className="py-3 px-3 text-slate-400">Centralized Cloud Server (AWS/Azure)</td>
                <td className="py-3 px-3 text-slate-400">Physical USB Security Dongle</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">Decentralized Ethereum Smart Contract</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Single Point of Failure (SPOF)</td>
                <td className="py-3 px-3 text-rose-400">High (Server outages lock all clients)</td>
                <td className="py-3 px-3 text-amber-400">Physical loss, theft, hardware failure</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">Zero (Distributed blockchain ledger)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Anti-Piracy Security</td>
                <td className="py-3 px-3 text-rose-400">Vulnerable to crack keys / keygens</td>
                <td className="py-3 px-3 text-slate-400">Driver emulation attacks</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">Cryptographic Keccak-256 Node-Locking</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Secondary Resale Market</td>
                <td className="py-3 px-3 text-rose-400">Forbidden / Non-existent</td>
                <td className="py-3 px-3 text-slate-400">Manual physical transfer (Unregulated)</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">Automated P2P with Creator Royalties</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Verification Cost (Gas)</td>
                <td className="py-3 px-3 text-slate-400">Server maintenance subscription costs</td>
                <td className="py-3 px-3 text-slate-400">Physical hardware manufacturing costs</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">0 Gas (Free local eth_call view)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Flow Diagram (Visual) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          End-to-End System Verification Flow
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Lifecycle sequence of cryptographic verification between client app and smart contract:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3 font-mono">1</div>
            <h4 className="font-bold text-white mb-1">License Minting</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Customer purchases license on Ethereum. Smart contract mints unique token ID with license tier, seats, and expiry date.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3 font-mono">2</div>
            <h4 className="font-bold text-white mb-1">Hardware Fingerprint</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Client device computes Keccak-256 hash of hardware identifiers (CPU, UUID, MAC). Hash is recorded on-chain via <code className="text-cyan-300">bindDevice()</code>.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3 font-mono">3</div>
            <h4 className="font-bold text-white mb-1">Challenge & Validate</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Software issues zero-gas <code className="text-cyan-300">verifyLicense()</code> call. Smart contract checks ownership, node-lock hash, and expiration.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3 font-mono">4</div>
            <h4 className="font-bold text-white mb-1">Execution Unlock</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Upon successful cryptographic confirmation, application memory unlocks protected functional modules and watermarks session.
            </p>
          </div>
        </div>
      </div>

      {/* Viva Voce Defense Prep (Interactive Accordion) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Viva Voce Oral Exam Questions & Answers
            </h3>
            <p className="text-xs text-slate-400">Study these comprehensive answers to ace your project presentation</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Viva Questions..."
              value={searchViva}
              onChange={(e) => setSearchViva(e.target.value)}
              className="input-field pl-9 text-xs py-2"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredViva.map((viva, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="bg-slate-900/80 rounded-xl border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-200 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">Q{idx + 1}.</span>
                    <span>{viva.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 border-t border-slate-800/50 text-xs text-slate-300 leading-relaxed bg-slate-950/40">
                    <strong className="text-emerald-400 block mb-1">Model Answer for Evaluator:</strong>
                    {viva.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
