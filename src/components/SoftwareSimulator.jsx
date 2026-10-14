import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Cpu, 
  Key, 
  Terminal, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Radio, 
  Laptop, 
  Hash, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PRESET_DEVICES, getDeviceFingerprint } from '../services/hardwareIdService';

export default function SoftwareSimulator({ 
  licenses, 
  products, 
  activeAccount, 
  initialLicenseId, 
  onVerifyLicense 
}) {
  const [selectedDevicePreset, setSelectedDevicePreset] = useState('device_win11');
  const [licenseInput, setLicenseInput] = useState(initialLicenseId ? initialLicenseId.toString() : '1001');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [activatedLicenseData, setActivatedLicenseData] = useState(null);

  // Simulated app dynamic state
  const [threatCount, setThreatCount] = useState(14);
  const [scanning, setScanning] = useState(false);
  const [packetStream, setPacketStream] = useState([
    { id: 1, proto: 'TLSv1.3', src: '192.168.1.45', dst: '104.21.5.19', status: 'VERIFIED_ENCRYPTED' },
    { id: 2, proto: 'HTTPS', src: '192.168.1.12', dst: '142.250.190.46', status: 'PASSED' },
    { id: 3, proto: 'SSH-2.0', src: '10.0.0.18', dst: '192.168.1.1', status: 'KEY_AUTHENTICATED' }
  ]);

  const currentDevice = getDeviceFingerprint(selectedDevicePreset);

  useEffect(() => {
    if (initialLicenseId) {
      setLicenseInput(initialLicenseId.toString());
    }
  }, [initialLicenseId]);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationSteps([]);
    setVerificationResult(null);

    const steps = [
      { id: 1, text: `Connecting to Ethereum Smart Contract RPC...` },
      { id: 2, text: `Querying Token #${licenseInput} on-chain state & ownership...` },
      { id: 3, text: `Checking Status: Revocation Registry & Subscription Expiry...` },
      { id: 4, text: `Verifying Hardware Node Fingerprint (${currentDevice.shortHash})...` },
      { id: 5, text: `Validating Cryptographic Nonce Challenge Signature...` }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setVerificationSteps(prev => [...prev, steps[i]]);
    }

    try {
      const result = onVerifyLicense(
        Number(licenseInput), 
        currentDevice.hash, 
        activeAccount ? activeAccount.address : null
      );

      setVerificationResult(result);
      if (result.isValid) {
        setIsActivated(true);
        setActivatedLicenseData({
          license: result.license,
          product: result.product,
          device: currentDevice
        });
      } else {
        setIsActivated(false);
      }
    } catch (err) {
      setVerificationResult({
        isValid: false,
        code: 'ERR_EXCEPTION',
        message: err.message || 'Verification failed unexpectedly'
      });
      setIsActivated(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeactivate = () => {
    setIsActivated(false);
    setVerificationResult(null);
    setVerificationSteps([]);
    setActivatedLicenseData(null);
  };

  const handleTriggerScan = () => {
    setScanning(true);
    setTimeout(() => {
      setThreatCount(prev => prev + 3);
      setPacketStream(prev => [
        { id: Date.now(), proto: 'TCP_SYN', src: '45.133.1.99', dst: '192.168.1.45', status: 'BLOCKED_BY_CYBERSHIELD' },
        ...prev.slice(0, 3)
      ]);
      setScanning(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Intro Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Client Software DRM Simulator</h2>
            <span className="badge badge-cyan text-xs">Live Desktop App Simulation</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Experience how a real desktop software client performs zero-gas on-chain cryptographic license validation and hardware node-locking before unlocking premium features.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          {isActivated ? (
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOFTWARE ACTIVATED & UNLOCKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>APPLICATION RESTRICTED / UNLICENSED</span>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Window Container (Styled as a native desktop application) */}
      <div className="glass-panel rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden bg-slate-950">
        
        {/* Native OS Window Title Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400 ml-2">
              CyberShield Pro Studio v4.2.0 — {isActivated ? 'Enterprise Activated' : 'LOCKED TRIAL'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="hidden sm:inline">Target Node:</span>
            <span className="text-cyan-400 font-semibold">{currentDevice.name}</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6">
          {!isActivated ? (
            /* ================================================================= */
            /* LOCKED / UNLICENSED STATE                                          */
            /* ================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: License Verification Challenge Form */}
              <div className="lg:col-span-5 bg-slate-900/80 rounded-xl p-5 border border-slate-800">
                <div className="flex items-center gap-2.5 mb-3 text-cyan-400">
                  <Key className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">License Activation Wizard</h3>
                </div>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Enter your Blockchain License Token ID. The application will query the Ethereum smart contract and verify hardware node-lock authorization.
                </p>

                {/* Machine Simulator Selector */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    Simulated Client Hardware:
                  </label>
                  <select
                    value={selectedDevicePreset}
                    onChange={(e) => setSelectedDevicePreset(e.target.value)}
                    className="input-field text-xs"
                  >
                    {PRESET_DEVICES.map(dev => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name} ({dev.specs.slice(0, 35)}...)
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-400">
                    <span className="text-slate-500 block">Calculated Keccak256 Machine Fingerprint:</span>
                    <span className="text-cyan-300 truncate block">{currentDevice.hash}</span>
                  </div>
                </div>

                {/* License ID Input */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                    License Token ID (On-Chain):
                  </label>
                  <input
                    type="number"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder="e.g. 1001"
                    className="input-field font-mono font-bold text-cyan-300"
                  />

                  {/* Quick Select from User Owned Licenses */}
                  {licenses && licenses.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 block mb-1">Quick Select Owned Token:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {licenses.map(lic => (
                          <button
                            key={lic.licenseId}
                            onClick={() => setLicenseInput(lic.licenseId.toString())}
                            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-all ${
                              licenseInput === lic.licenseId.toString()
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            #{lic.licenseId} ({lic.owner.slice(0, 6)}...)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Wallet */}
                <div className="mb-6 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-slate-500 text-[10px] block">Requesting Wallet Identity:</span>
                  <span className="text-slate-300 truncate block">{activeAccount?.address}</span>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleRunVerification}
                  disabled={isVerifying || !licenseInput}
                  className="w-full btn-primary text-xs py-2.5 font-semibold flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying Smart Contract DRM...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Verify License on Blockchain</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Interactive Verification Pipeline & Diagnostic Log */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Visual Pipeline Box */}
                <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 min-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      Cryptographic On-Chain Audit Log
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Standard: EIP-712 Challenge-Response
                    </span>
                  </div>

                  {verificationSteps.length === 0 && !isVerifying && !verificationResult && (
                    <div className="text-center py-10 text-xs text-slate-500">
                      Click <strong className="text-slate-300">"Verify License on Blockchain"</strong> to initiate real-time smart contract verification and hardware binding checks.
                    </div>
                  )}

                  {/* Step-by-step progress */}
                  <div className="space-y-2 font-mono text-xs">
                    {verificationSteps.map(step => (
                      <div key={step.id} className="flex items-center gap-2 text-cyan-300 animate-in fade-in slide-in-from-left-2 duration-150">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{step.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Verification Outcome Banner */}
                  {verificationResult && (
                    <div className={`mt-5 p-4 rounded-xl border text-xs ${
                      verificationResult.isValid
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        {verificationResult.isValid ? (
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-sm mb-1">
                            {verificationResult.isValid ? 'License Authenticated Successfully' : 'Verification Rejection'}
                          </div>
                          <div className="leading-relaxed">
                            {verificationResult.message}
                          </div>
                          {!verificationResult.isValid && (
                            <div className="mt-2 text-[11px] text-slate-400">
                              Tip: If machine mismatch error occurred, go to <strong>"My Licenses"</strong> tab and click <strong>"Authorize / Bind Device Hardware ID"</strong> for this machine!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Locked Preview Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden">
                    <Lock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Packet Analyzer</span>
                    <span className="text-[10px] text-rose-400 uppercase font-mono">Locked</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden">
                    <Lock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Zero-Day Sandbox</span>
                    <span className="text-[10px] text-rose-400 uppercase font-mono">Locked</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center relative overflow-hidden">
                    <Lock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Cloud Decryptor</span>
                    <span className="text-[10px] text-rose-400 uppercase font-mono">Locked</span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ================================================================= */
            /* ACTIVATED PRO SUITE WORKSPACE                                     */
            /* ================================================================= */
            <div className="space-y-6">
              
              {/* Unlocked Credentials Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">
                        {activatedLicenseData?.product?.name || 'CyberShield Enterprise'}
                      </h4>
                      <span className="badge badge-emerald text-[10px]">VERIFIED ON-CHAIN</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Token ID: #{activatedLicenseData?.license?.licenseId} • Authorized Device: {activatedLicenseData?.device?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">License Owner:</span>
                    <span className="font-mono text-cyan-400">
                      {activatedLicenseData?.license?.owner?.slice(0, 8)}...{activatedLicenseData?.license?.owner?.slice(-6)}
                    </span>
                  </div>
                  <button
                    onClick={handleDeactivate}
                    className="btn-secondary text-xs py-1.5 px-3 text-slate-400 hover:text-rose-400"
                  >
                    Lock / Deactivate
                  </button>
                </div>
              </div>

              {/* Live Interactive Security Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Widget 1: Threat Detection Engine */}
                <div className="glass-card p-5 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      Intrusion Prevention
                    </span>
                    <span className="badge badge-emerald text-[10px]">ACTIVE</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono mb-1">
                    {threatCount}
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Threats neutralized today on this node</p>
                  <button
                    onClick={handleTriggerScan}
                    disabled={scanning}
                    className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    {scanning ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{scanning ? 'Scanning Ports...' : 'Scan Active Connections'}</span>
                  </button>
                </div>

                {/* Widget 2: Node-Lock Status */}
                <div className="glass-card p-5 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-violet-400" />
                      Hardware Node-Lock
                    </span>
                    <span className="badge badge-cyan text-[10px]">SECURED</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 space-y-1.5 mb-4">
                    <div className="truncate">
                      <span className="text-slate-500">Hash: </span>
                      <span className="text-cyan-300">{activatedLicenseData?.device?.hash}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Machine OS: </span>
                      <span className="text-white">{activatedLicenseData?.device?.os}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Seat Utilization: </span>
                      <span className="text-emerald-400 font-bold">1 / {activatedLicenseData?.license?.maxSeats} Validated</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    Protected against binary cloning & VM replication.
                  </div>
                </div>

                {/* Widget 3: Cryptographic Health */}
                <div className="glass-card p-5 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Ledger Integrity
                    </span>
                    <span className="badge badge-emerald text-[10px]">SYNCED</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-slate-300 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Block Sync:</span>
                      <span className="text-cyan-400 font-bold">#19,854,013</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gas Verification:</span>
                      <span className="text-emerald-400">0 Gas (eth_call)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">DRM Contract:</span>
                      <span className="text-slate-300">0x5FbD...0aa3</span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] text-emerald-300">
                    License verified via zero-knowledge challenge proof.
                  </div>
                </div>

              </div>

              {/* Live Network Stream Console */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Live Traffic & Threat Mitigation Stream
                  </span>
                  <span className="text-[10px] text-emerald-400">STREAMING • 60 FPS</span>
                </div>
                <div className="space-y-1.5">
                  {packetStream.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/40 last:border-0">
                      <span className="text-cyan-400">{p.proto}</span>
                      <span className="text-slate-300">{p.src} ➔ {p.dst}</span>
                      <span className="text-emerald-400 font-semibold">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
