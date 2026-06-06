import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { abort } from '@nano_kit/query'
import { useSignal } from '@nano_kit/react'
import cx from 'clsx'
import type { ApplicationDraft } from '~/services/application.types'
import typography from '~/uikit/typography.module.css'
import { MAX_DETAILS_LENGTH } from '~/constants'
import { useFormValidity } from '~/uikit/hooks'
import { Button } from '~/uikit/Button'
import {
  type FormProps,
  Form
} from '~/uikit/Form'
import { SubHeader } from '~/uikit/SubHeader'
import { FormGroup } from '~/uikit/FormGroup'
import { TextArea } from '~/uikit/TextArea'
import { TextInput } from '~/uikit/TextInput'
import { ErrorMessage } from '~/uikit/ErrorMessage'
import { navigation } from '~/stores/router'
import {
  $currentApplication,
  $upsertApplicationError,
  $upsertApplicationLoading,
  upsertApplication
} from '~/stores/application'
import { Icon } from '~/uikit/Icon'
import { shouldPreventTransition } from './utils'
import styles from './ApplicationForm.module.css'

export interface ApplicationFormProps extends Omit<FormProps, 'onSubmit'> {
  onSubmit?: () => void
}

const EMPTY_DRAFT = {
  title: '',
  company: '',
  skills: '',
  details: '',
  letter: ''
}

export function ApplicationForm({
  className,
  onSubmit,
  ...props
}: ApplicationFormProps) {
  const currentApplication = useSignal($currentApplication)
  const errorMessage = useSignal($upsertApplicationError)
  const isLoading = useSignal($upsertApplicationLoading)
  const formRef = useRef<HTMLFormElement>(null)
  const upsertTaskRef = useRef<Promise<unknown> | null>(null)
  const [formData, setFormData] = useState<ApplicationDraft>(EMPTY_DRAFT)
  const isValid = useFormValidity(formRef)
  const onSubmitCallback = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLoading) {
      onSubmit?.()
      upsertTaskRef.current = upsertApplication(formData)
    }
  }, [formData, isLoading, onSubmit])
  const onChangeCallback = useCallback((
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      name,
      value
    } = event.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])
  const title = useMemo(
    () => [formData.title, formData.company].filter(v => v.trim()).join(', ') ?? '',
    [formData.title, formData.company]
  )

  useEffect(() => {
    if (currentApplication) {
      setFormData(currentApplication)
    } else {
      setFormData(EMPTY_DRAFT)
    }
  }, [currentApplication])

  useEffect(() => {
    const originalTransition = navigation.transition
    const shouldPrevent = isLoading || shouldPreventTransition(currentApplication, formData)

    navigation.transition = (proceed, nextLocation, prevLocation) => {
      if (
        prevLocation.route === 'newApplication' && nextLocation?.route === 'application'
        || !shouldPrevent
        // oxlint-disable-next-line eslint/no-alert
        || shouldPrevent && confirm('You have unsaved changes. Are you sure you want to leave this page?')
      ) {
        if (upsertTaskRef.current) {
          abort(upsertTaskRef.current)
        }

        proceed(nextLocation)
      }
    }

    window.onbeforeunload = (event) => {
      if (shouldPrevent) {
        event.preventDefault()
        // oxlint-disable-next-line typescript/no-deprecated
        event.returnValue = ''
      }
    }

    return () => {
      navigation.transition = originalTransition
      window.onbeforeunload = null
    }
  }, [currentApplication, formData, isLoading])

  return (
    <Form
      ref={formRef}
      className={cx(styles.root, className)}
      onSubmit={onSubmitCallback}
      aria-busy={isLoading}
      {...props}
    >
      <SubHeader
        title={(
          <h1 className={cx(typography.h2, !title && styles.titlePlaceholder)}>
            {title || 'New application'}
          </h1>
        )}
      />
      <FormGroup
        label='Job title'
        controlId='title'
      >
        <TextInput
          id='title'
          name='title'
          placeholder='Product manager'
          maxLength={25}
          value={formData.title}
          onChange={onChangeCallback}
          required
          autoComplete='on'
        />
      </FormGroup>
      <FormGroup
        label='Company'
        controlId='company'
      >
        <TextInput
          id='company'
          name='company'
          placeholder='Apple'
          maxLength={25}
          value={formData.company}
          onChange={onChangeCallback}
          required
          autoComplete='on'
        />
      </FormGroup>
      <FormGroup
        label='I am good at...'
        controlId='skills'
      >
        <TextInput
          id='skills'
          name='skills'
          placeholder='HTML, CSS and doing things in time'
          maxLength={50}
          value={formData.skills}
          onChange={onChangeCallback}
          required
          autoComplete='on'
        />
      </FormGroup>
      <FormGroup
        label='Additional details'
        controlId='details'
        description={`${formData.details.length}/${MAX_DETAILS_LENGTH}`}
      >
        <TextArea
          className={styles.textarea}
          id='details'
          name='details'
          placeholder='Describe why you are a great fit or paste your bio'
          maxLength={MAX_DETAILS_LENGTH}
          value={formData.details}
          onChange={onChangeCallback}
          required
          autoComplete='on'
          aria-describedby='details-description'
        />
      </FormGroup>
      <Button
        type='submit'
        variant={formData.id ? 'default' : 'primary'}
        size='lg'
        disabled={!isValid}
        icon={isLoading
          ? <Icon name='flower'/>
          : formData.id
            ? <Icon name='retry'/>
            : null}
      >
        {isLoading
          ? null
          : formData.id
            ? 'Try Again'
            : 'Generate Now'}
      </Button>
      <ErrorMessage>
        {errorMessage}
      </ErrorMessage>
    </Form>
  )
}
