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
  const [emailCode, setEmailCode] = useState('')
  const [emailSetupStarted, setEmailSetupStarted] = useState(false)
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false)

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

  const startEmail2FASetup = async () => {
    setError('')
    setSuccess('')
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/setup')
      setEmailSetupStarted(true)
      setSuccess('Un code a 6 chiffres vient d\'etre envoye a votre adresse e-mail.')
    } catch (err) {
      setError('Impossible d\'envoyer le code de securite par e-mail.')
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const enableEmail2FA = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/enable', { code: emailCode })
      setSuccess('Double authentification par e-mail activee.')
      setEmailCode('')
      setEmailSetupStarted(false)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError('Code e-mail invalide ou expire.')
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const disableEmail2FA = async () => {
    setError('')
    setSuccess('')
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/disable')
      setSuccess('Double authentification par e-mail desactivee.')
      setEmailCode('')
      setEmailSetupStarted(false)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError('Impossible de desactiver la double authentification par e-mail.')
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const toggleLoginNotifications = async () => {
    setError('')
    setSuccess('')
    try {
      const nextState = !currentUser.loginNotificationEnabled
      await apiPost('/api/security/2fa/login-notifications/toggle', { enabled: nextState })
      setSuccess(nextState ? 'Notifications de connexion activees.' : 'Notifications de connexion desactivees.')
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError('Impossible de modifier les notifications de connexion.')
    }
  }

  const sendLoginNotificationTest = async () => {
    setError('')
    setSuccess('')
    try {
      await apiPost('/api/security/2fa/login-notifications/test')
      setSuccess('E-mail de test de notification de connexion envoye.')
    } catch (err) {
      setError('Impossible d\'envoyer le test de notification.')
    }
  }

  return (
    <div className="security-settings">
      <h3>Sécurité & Double Authentification (A2F)</h3>
      <p>Renforcez la sécurité de votre compte CYNA-IT en activant l'authentification à deux facteurs.</p>

      {error && <div className="auth-feedback auth-feedback-error">{error}</div>}
      {success && <div className="auth-feedback auth-feedback-success">{success}</div>}

      <div className="security-card">
        <h4>Code de connexion par e-mail</h4>
        <p style={{ marginBottom: '1rem' }}>
          Recevez un code aleatoire a 6 chiffres par e-mail apres validation du mot de passe.
        </p>

        <div className="security-status">
          <strong>Statut e-mail : </strong>
          {currentUser.emailTwoFactorEnabled ? (
            <span className="text-success">Active</span>
          ) : (
            <span className="text-danger">Desactive</span>
          )}
        </div>

        {!currentUser.emailTwoFactorEnabled ? (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <button className="button-primary" type="button" onClick={startEmail2FASetup} disabled={isEmailActionLoading}>
              Envoyer un code de validation
            </button>

            {emailSetupStarted && (
              <form onSubmit={enableEmail2FA} style={{ display: 'grid', gap: '0.8rem' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  className="verification-input"
                  required
                />
                <button type="submit" className="button-primary" disabled={isEmailActionLoading}>
                  Activer la 2FA e-mail
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button className="button-danger" type="button" onClick={disableEmail2FA} disabled={isEmailActionLoading}>
              Desactiver la 2FA e-mail
            </button>
          </div>
        )}
      </div>

      <div className="security-card">
        <h4>Alertes de connexion</h4>
        <p style={{ marginBottom: '1rem' }}>
          Recevez un e-mail apres chaque connexion avec l'adresse IP, le systeme, le navigateur et l'heure de connexion.
        </p>

        <label className="security-checkbox">
          <input
            type="checkbox"
            checked={Boolean(currentUser.loginNotificationEnabled)}
            onChange={toggleLoginNotifications}
          />
          <span>Envoyer un e-mail de securite apres chaque connexion</span>
        </label>

        <div className="actions" style={{ marginTop: '1rem' }}>
          <button className="button-secondary" type="button" onClick={sendLoginNotificationTest}>
            Envoyer un e-mail de test
          </button>
        </div>
      </div>

      <div className="security-card">
        <h4>Application d'authentification</h4>
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
