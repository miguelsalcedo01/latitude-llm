'use client'

import { FormEvent, ReactNode, useCallback, useState } from 'react'

import {
  Button,
  CloseTrigger,
  FormWrapper,
  Icon,
  Input,
  Modal,
  Select,
} from '@latitude-data/web-ui'
import { useNavigate } from '$/hooks/useNavigate'
import { ROUTES } from '$/services/routes'
import useIntegrations from '$/stores/integrations'
import { IntegrationConfigurationForm } from '$/app/(private)/settings/_components/Integrations/New/_components/Configuration'
import {
  HostedIntegrationType,
  IntegrationType,
} from '@latitude-data/constants'
import { buildIntegrationPayload } from './buildIntegrationPayload'
import {
  HOSTED_INTEGRATION_TYPE_OPTIONS,
  INTEGRATION_TYPE_VALUES,
} from '$/lib/integrationTypeOptions'

const SELECTABLE_TYPES: {
  value: IntegrationType | HostedIntegrationType
  label: string
  icon: ReactNode
}[] = [
  {
    value: IntegrationType.ExternalMCP,
    label: INTEGRATION_TYPE_VALUES[IntegrationType.ExternalMCP].label,
    icon: (
      <Icon name={INTEGRATION_TYPE_VALUES[IntegrationType.ExternalMCP].icon} />
    ),
  },
  ...Object.values(HostedIntegrationType).map((value) => ({
    value,
    label: HOSTED_INTEGRATION_TYPE_OPTIONS[value].label,
    icon: <Icon name={HOSTED_INTEGRATION_TYPE_OPTIONS[value].icon} />,
  })),
]

export default function NewIntegration() {
  const navigate = useNavigate()
  const onOpenChange = useCallback(
    (open: boolean) => !open && navigate.push(ROUTES.settings.root),
    [navigate],
  )
  const { create } = useIntegrations()
  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const payload = buildIntegrationPayload({
        formData: new FormData(event.currentTarget),
      })

      console.log('payload', payload)

      const hostedType = payload.type as unknown as HostedIntegrationType
      if (Object.values(HostedIntegrationType).includes(hostedType)) {
        payload.configuration = {
          ...(payload.configuration ?? {}),
          type: hostedType,
        }
        payload.type = IntegrationType.HostedMCP
      }
      const [_, error] = await create(payload)

      if (!error) onOpenChange(false)
    },
    [create],
  )

  const [integrationType, setIntegrationType] = useState<
    IntegrationType | HostedIntegrationType | undefined
  >()

  return (
    <Modal
      dismissible
      open
      onOpenChange={onOpenChange}
      title='Create Integration'
      description='Integrations allow you to add soure of tools to your prompts.'
      footer={
        <>
          <CloseTrigger />
          <Button fancy form='createIntegrationForm' type='submit'>
            Create Integration
          </Button>
        </>
      }
    >
      <form id='createIntegrationForm' onSubmit={onSubmit}>
        <FormWrapper>
          <Input
            required
            type='text'
            name='name'
            label='Name'
            description="This is the name you'll use in the prompt editor to refer to use this integration and model."
            placeholder='my_integration'
          />
          <Select
            required
            name='type'
            options={SELECTABLE_TYPES}
            onChange={(value) => setIntegrationType(value)}
            label='Type'
          />

          {integrationType ? (
            <IntegrationConfigurationForm integrationType={integrationType} />
          ) : null}
        </FormWrapper>
      </form>
    </Modal>
  )
}
