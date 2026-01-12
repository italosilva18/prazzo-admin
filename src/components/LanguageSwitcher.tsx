import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supportedLanguages, changeLanguage, type SupportedLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// Flag components using text instead of emojis
const FlagIcon = ({ code }: { code: string }) => {
  const flagStyles: Record<string, string> = {
    BR: 'bg-green-600',
    US: 'bg-blue-600',
    ES: 'bg-yellow-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-5 h-4 rounded-sm text-[10px] font-bold text-white',
        flagStyles[code] || 'bg-gray-400'
      )}
    >
      {code}
    </span>
  )
}

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'ghost',
  size = 'default',
  showLabel = true,
  className,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()

  const currentLanguage = supportedLanguages.find((lang) => lang.code === i18n.language) || supportedLanguages[0]

  const handleLanguageChange = async (languageCode: SupportedLanguage) => {
    await changeLanguage(languageCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <>
              <FlagIcon code={currentLanguage.flag} />
              <span className="hidden sm:inline">{currentLanguage.name}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              'gap-3 cursor-pointer',
              i18n.language === language.code && 'bg-accent'
            )}
          >
            <FlagIcon code={language.flag} />
            <span>{language.name}</span>
            {i18n.language === language.code && (
              <span className="ml-auto text-primary text-xs">*</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for mobile or sidebar
export function LanguageSwitcherCompact({ className }: { className?: string }) {
  const { i18n } = useTranslation()

  const currentLanguage = supportedLanguages.find((lang) => lang.code === i18n.language) || supportedLanguages[0]
  const currentIndex = supportedLanguages.findIndex((lang) => lang.code === i18n.language)

  const handleCycleLanguage = async () => {
    const nextIndex = (currentIndex + 1) % supportedLanguages.length
    const nextLanguage = supportedLanguages[nextIndex]
    await changeLanguage(nextLanguage.code)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCycleLanguage}
      className={className}
      title={currentLanguage.name}
    >
      <FlagIcon code={currentLanguage.flag} />
    </Button>
  )
}

export default LanguageSwitcher
