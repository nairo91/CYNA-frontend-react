import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { apiPost } from '../../api/http'

export default function SecuritySettings({ currentUser, onUserUpdate }) {
  const [isEnabling, setIsEnabling] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // États pour le panneau de test de la 2FA
  const [isTesting, setIsTesting] = useState(false)
  const [testCode, setTestCode] = useState('')
  const [testSuccess, setTestSuccess] = useState('')
  const [testError, setTestError] = useState('')

  const startSetup = async () => {
    setError('')
    setSuccess('')
    try {
      const data = await apiPost('/api/security/2fa/setup')
      setSetupData(data)
      setIsEnabling(true)
    } catch (err) {
      setError('Erreur lors de la configuration de la 2FA.')
    }
  }

  const confirmEnable = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await apiPost('/api/security/2fa/enable', { code: verificationCode })
      setSuccess('Authentification à deux facteurs configurée et activée !')
      setIsEnabling(false)
      setSetupData(null)
      setVerificationCode('')
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError('Code invalide. Veuillez réessayer.')
    }
  }

  const handleToggleLogin = async () => {
    setError('')
    setSuccess('')
    try {
      const nextState = !currentUser.totpEnabled
      await apiPost('/api/security/2fa/toggle-login', { enabled: nextState })
      setSuccess(
        nextState
          ? "Double authentification activée pour vos prochaines connexions."
          : "Double authentification désactivée pour la connexion (votre configuration est conservée).",
      )
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError("Impossible de modifier le paramètre de connexion.")
    }
  }

  const runTestCode = async (e) => {
    e.preventDefault()
    setTestError('')
    setTestSuccess('')
    try {
      await apiPost('/api/security/2fa/test', { code: testCode })
      setTestSuccess("Code 2FA valide ! La synchronisation est parfaite.")
      setTestCode('')
    } catch (err) {
      setTestError("Code invalide. Vérifiez l'heure de votre appareil.")
    }
  }

  const disable2FA = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver et réinitialiser la 2FA ?')) return
    setError('')
    setSuccess('')
    setIsTesting(false)
    try {
      await apiPost('/api/security/2fa/disable')
      setSuccess('L\'authentification à deux facteurs a été désactivée et réinitialisée.')
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError('Erreur lors de la désactivation.')
    }
  }

  return (
    <div className="security-settings">
      <h3>Sécurité & Double Authentification (A2F)</h3>
      <p>Renforcez la sécurité de votre compte CYNA-IT en activant l'authentification à deux facteurs.</p>

      {error && <div className="auth-feedback auth-feedback-error">{error}</div>}
      {success && <div className="auth-feedback auth-feedback-success">{success}</div>}

      <div className="security-card">
        <div className="security-status">
          <strong>Configuration : </strong>
          {currentUser.isTotpConfigured ? (
            <span className="text-success">Configurée</span>
          ) : (
            <span className="text-danger">Non configurée</span>
          )}
        </div>

        {/* 1. CAS: A2F NON CONFIGURÉE */}
        {!currentUser.isTotpConfigured && !isEnabling && (
          <div>
            <p style={{ marginBottom: '1.25rem' }}>
              L'authentification à deux facteurs n'est pas encore configurée sur votre compte. Activez-la pour générer des codes de validation à 6 chiffres via des applications telles que Google Authenticator, Authy ou Microsoft Authenticator.
            </p>
            <button className="button-primary" onClick={startSetup}>
              Configurer la 2FA
            </button>
          </div>
        )}

        {/* 2. CAS: EN COURS DE CONFIGURATION */}
        {isEnabling && setupData && (
          <div className="setup-container">
            <h4>Étape de configuration</h4>
            <p>1. Scannez ce QR Code avec votre application d'authentification :</p>
            <div className="qr-code-wrapper">
              <QRCodeSVG value={setupData.qrCodeContent} size={200} />
            </div>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.2rem' }}>
              Ou saisissez manuellement la clé secrète : <code>{setupData.secret}</code>
            </p>

            <form onSubmit={confirmEnable} style={{ display: 'grid', gap: '0.8rem' }}>
              <p>2. Saisissez le code à 6 chiffres généré par votre application pour confirmer l'activation :</p>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="verification-input"
                required
              />
              <div className="actions">
                <button type="submit" className="button-primary">Confirmer et Activer</button>
                <button type="button" className="button-secondary" onClick={() => setIsEnabling(false)}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* 3. CAS: A2F CONFIGURÉE */}
        {currentUser.isTotpConfigured && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <p>
              L'authentification à deux facteurs est configurée sur votre compte. Vous pouvez tester sa synchronisation ou choisir de l'exiger lors de vos connexions.
            </p>

            {/* Checkbox Activer lors de la connexion */}
            <label className="security-checkbox">
              <input
                type="checkbox"
                checked={currentUser.totpEnabled}
                onChange={handleToggleLogin}
              />
              <span>Exiger le code de sécurité 2FA à la connexion</span>
            </label>

            {/* Actions principales */}
            <div className="actions">
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  setIsTesting(!isTesting)
                  setTestError('')
                  setTestSuccess('')
                  setTestCode('')
                }}
              >
                {isTesting ? 'Masquer le panneau de test' : 'Tester le code A2F'}
              </button>

              <button type="button" className="button-danger" onClick={disable2FA}>
                Désactiver & Réinitialiser la 2FA
              </button>
            </div>

            {/* Panneau de test */}
            {isTesting && (
              <div className="test-container">
                <h4>Vérification de synchronisation</h4>
                <p>Saisissez le code temporaire généré par votre application d'authentification pour vous assurer qu'il est correct :</p>
                
                {testError && <div className="auth-feedback auth-feedback-error">{testError}</div>}
                {testSuccess && <div className="auth-feedback auth-feedback-success">{testSuccess}</div>}

                <form onSubmit={runTestCode} style={{ display: 'grid', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                    className="verification-input"
                    required
                  />
                  <div className="actions">
                    <button type="submit" className="button-primary">Vérifier le code</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
