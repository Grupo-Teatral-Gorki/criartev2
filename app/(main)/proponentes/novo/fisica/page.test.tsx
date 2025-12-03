import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PessoaFisicaPage from './page';
import { useAuth } from '@/app/context/AuthContext';
import ProponenteService from '@/app/services/proponenteService';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/app/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/app/services/proponenteService', () => ({
    __esModule: true,
    default: {
        getInstance: jest.fn(),
    },
}));

jest.mock('@/app/(main)/proponentes/consts/pf', () => ({
    proponenteFisicaForm: {
        dadosPessoais: [
            { name: 'nomeCompleto', label: 'Nome completo', type: 'string', required: true },
            { name: 'cpf', label: 'CPF', type: 'string', required: true },
        ],
        contato: [
            { name: 'email', label: 'E-mail', type: 'string', required: true },
        ],
        endereco: [
            { name: 'CEP', label: 'CEP', type: 'string', required: true },
        ],
        perfilDoProponente: {
            informacoesDemograficas: [
                {
                    name: 'sexo', label: 'Sexo', type: 'select', required: true, options: [
                        { value: 'feminino', label: 'Feminino' },
                        { value: 'masculino', label: 'Masculino' },
                    ]
                },
            ],
            experiencia: [
                {
                    name: 'demaisAreasAtuacaoCultural', label: 'Demais áreas', type: 'multiselect', required: true, options: [
                        { value: 'musica', label: 'Música' },
                        { value: 'teatro', label: 'Teatro' },
                    ]
                },
            ],
            aspectosFinanceiros: [],
            objetivos: [],
        },
    },
}));

describe('PessoaFisicaPage', () => {
    const mockRouter = {
        push: jest.fn(),
    };

    const mockUser = {
        uid: 'test-user-id',
        email: 'test@example.com',
    };

    const mockDbUser = {
        cityId: 'test-city-id',
    };

    const mockSaveProponente = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            dbUser: mockDbUser,
        });
        (ProponenteService.getInstance as jest.Mock).mockReturnValue({
            saveProponente: mockSaveProponente,
        });
    });

    // Helper function to navigate to last step
    const navigateToLastStep = async () => {
        for (let i = 0; i < 6; i++) {
            await waitFor(() => {
                const nextButton = screen.queryByText('Próximo');
                expect(nextButton).toBeInTheDocument();
            });
            const nextButton = screen.getByText('Próximo');
            fireEvent.click(nextButton);
        }
        // Wait for final button to appear
        await waitFor(() => {
            expect(screen.getByText('Finalizar Cadastro')).toBeInTheDocument();
        });
    };

    describe('Form Rendering', () => {
        it('should render the form with title', () => {
            render(<PessoaFisicaPage />);
            expect(screen.getByText('Cadastro de Pessoa Física')).toBeInTheDocument();
        });

        it('should render all step indicators', () => {
            render(<PessoaFisicaPage />);
            expect(screen.getAllByText('Dados Pessoais').length).toBeGreaterThan(0);
            expect(screen.getByText('Contato')).toBeInTheDocument();
            expect(screen.getByText('Endereço')).toBeInTheDocument();
        });

        it('should render back button', () => {
            render(<PessoaFisicaPage />);
            expect(screen.getByText('Voltar')).toBeInTheDocument();
        });

        it('should render first step fields', () => {
            render(<PessoaFisicaPage />);
            expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument();
        });
    });

    describe('Form Navigation', () => {
        it('should navigate to next step when clicking Próximo', async () => {
            render(<PessoaFisicaPage />);

            const nextButton = screen.getByText('Próximo');
            fireEvent.click(nextButton);

            // Should show second step fields
            await waitFor(() => {
                expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
            });
        });

        it('should navigate to previous step when clicking Anterior', async () => {
            render(<PessoaFisicaPage />);

            // Go to second step
            fireEvent.click(screen.getByText('Próximo'));

            await waitFor(() => {
                expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
            });

            // Go back to first step
            fireEvent.click(screen.getByText('Anterior'));

            await waitFor(() => {
                expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
            });
        });

        it('should disable Anterior button on first step', () => {
            render(<PessoaFisicaPage />);

            const previousButton = screen.getByText('Anterior');
            expect(previousButton).toBeDisabled();
        });

        it('should show Finalizar Cadastro button on last step', async () => {
            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            expect(screen.getByText('Finalizar Cadastro')).toBeInTheDocument();
        });
    });

    describe('Form Input Handling', () => {
        it('should handle text input changes', () => {
            render(<PessoaFisicaPage />);

            const nameInput = screen.getByLabelText(/Nome completo/i) as HTMLInputElement;
            fireEvent.change(nameInput, { target: { value: 'João Silva' } });

            expect(nameInput.value).toBe('João Silva');
        });

        it('should handle select input changes', async () => {
            render(<PessoaFisicaPage />);

            // Navigate to step with select
            for (let i = 0; i < 3; i++) {
                await waitFor(() => {
                    expect(screen.getByText('Próximo')).toBeInTheDocument();
                });
                fireEvent.click(screen.getByText('Próximo'));
            }

            await waitFor(() => {
                expect(screen.getByLabelText(/Sexo/i)).toBeInTheDocument();
            });

            const selectInput = screen.getByLabelText(/Sexo/i) as HTMLSelectElement;
            fireEvent.change(selectInput, { target: { value: 'masculino' } });

            expect(selectInput.value).toBe('masculino');
        });

        it('should handle multiselect checkbox changes', async () => {
            render(<PessoaFisicaPage />);

            // Navigate to step with multiselect
            for (let i = 0; i < 4; i++) {
                await waitFor(() => {
                    expect(screen.getByText('Próximo')).toBeInTheDocument();
                });
                fireEvent.click(screen.getByText('Próximo'));
            }

            await waitFor(() => {
                expect(screen.getByLabelText(/Música/i)).toBeInTheDocument();
            });

            const musicCheckbox = screen.getByLabelText(/Música/i) as HTMLInputElement;
            fireEvent.click(musicCheckbox);

            expect(musicCheckbox.checked).toBe(true);
        });

        it('should handle multiple multiselect selections', async () => {
            render(<PessoaFisicaPage />);

            // Navigate to step with multiselect
            for (let i = 0; i < 4; i++) {
                await waitFor(() => {
                    expect(screen.getByText('Próximo')).toBeInTheDocument();
                });
                fireEvent.click(screen.getByText('Próximo'));
            }

            await waitFor(() => {
                expect(screen.getByLabelText(/Música/i)).toBeInTheDocument();
            });

            const musicCheckbox = screen.getByLabelText(/Música/i) as HTMLInputElement;
            const teatroCheckbox = screen.getByLabelText(/Teatro/i) as HTMLInputElement;

            fireEvent.click(musicCheckbox);
            fireEvent.click(teatroCheckbox);

            expect(musicCheckbox.checked).toBe(true);
            expect(teatroCheckbox.checked).toBe(true);
        });

        it('should uncheck multiselect option when clicked again', async () => {
            render(<PessoaFisicaPage />);

            // Navigate to step with multiselect
            for (let i = 0; i < 4; i++) {
                await waitFor(() => {
                    expect(screen.getByText('Próximo')).toBeInTheDocument();
                });
                fireEvent.click(screen.getByText('Próximo'));
            }

            await waitFor(() => {
                expect(screen.getByLabelText(/Música/i)).toBeInTheDocument();
            });

            const musicCheckbox = screen.getByLabelText(/Música/i) as HTMLInputElement;

            fireEvent.click(musicCheckbox);
            expect(musicCheckbox.checked).toBe(true);

            fireEvent.click(musicCheckbox);
            expect(musicCheckbox.checked).toBe(false);
        });
    });

    describe('Form Submission', () => {
        it('should show error if user is not authenticated', async () => {
            (useAuth as jest.Mock).mockReturnValue({
                user: null,
                dbUser: null,
            });

            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Erro: Usuário não autenticado.');
            });
            alertSpy.mockRestore();
        });

        it('should show error if city is not found', async () => {
            (useAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                dbUser: { cityId: null },
            });

            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Erro: Cidade do usuário não encontrada.');
            });
            alertSpy.mockRestore();
        });

        it('should save proponente with correct data structure', async () => {
            mockSaveProponente.mockResolvedValue('test-proponente-id');

            render(<PessoaFisicaPage />);

            // Fill some data
            fireEvent.change(screen.getByLabelText(/Nome completo/i), { target: { value: 'João Silva' } });

            // Navigate to last step
            await navigateToLastStep();

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                expect(mockSaveProponente).toHaveBeenCalledWith(
                    'fisica',
                    expect.objectContaining({
                        tipo: 'fisica',
                        userId: 'test-user-id',
                        userEmail: 'test@example.com',
                        cityId: 'test-city-id',
                        dadosPessoais: expect.any(Object),
                        contato: expect.any(Object),
                        endereco: expect.any(Object),
                        perfilDoProponente: expect.objectContaining({
                            informacoesDemograficas: expect.any(Object),
                            experiencia: expect.any(Object),
                            aspectosFinanceiros: expect.any(Object),
                            objetivos: expect.any(Object),
                        }),
                    }),
                    'test-user-id',
                    'test@example.com',
                    'test-city-id'
                );
            });
        });

        it('should convert multiselect values to arrays', async () => {
            mockSaveProponente.mockResolvedValue('test-proponente-id');

            render(<PessoaFisicaPage />);

            // Navigate to multiselect step (step 5 - Experiência)
            for (let i = 0; i < 4; i++) {
                await waitFor(() => {
                    expect(screen.getByText('Próximo')).toBeInTheDocument();
                });
                fireEvent.click(screen.getByText('Próximo'));
            }

            // Wait for multiselect options to appear
            await waitFor(() => {
                expect(screen.getByLabelText(/Música/i)).toBeInTheDocument();
            });

            // Select multiple options
            fireEvent.click(screen.getByLabelText(/Música/i));
            fireEvent.click(screen.getByLabelText(/Teatro/i));

            // Navigate to last step
            for (let i = 0; i < 2; i++) {
                await waitFor(() => {
                    const nextButton = screen.queryByText('Próximo');
                    expect(nextButton).toBeInTheDocument();
                });
                const nextButton = screen.getByText('Próximo');
                fireEvent.click(nextButton);
            }

            await waitFor(() => {
                expect(screen.getByText('Finalizar Cadastro')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                const callArgs = mockSaveProponente.mock.calls[0][1];
                expect(callArgs.perfilDoProponente.experiencia.demaisAreasAtuacaoCultural).toEqual(['musica', 'teatro']);
            });
        });

        it('should show success message and redirect after save', async () => {
            mockSaveProponente.mockResolvedValue('test-proponente-id');
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Proponente cadastrado com sucesso!');
                expect(mockRouter.push).toHaveBeenCalledWith('/proponentes');
            });

            alertSpy.mockRestore();
        });

        it('should show error message if save fails', async () => {
            mockSaveProponente.mockRejectedValue(new Error('Save failed'));
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            fireEvent.click(screen.getByText('Finalizar Cadastro'));

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith('Erro ao salvar proponente. Por favor, tente novamente.');
            });

            alertSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it('should disable submit button while saving', async () => {
            mockSaveProponente.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(<PessoaFisicaPage />);

            // Navigate to last step
            await navigateToLastStep();

            const submitButton = screen.getByText('Finalizar Cadastro');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Salvando...')).toBeInTheDocument();
            });
        });
    });

    describe('Back Navigation', () => {
        it('should navigate back to proponentes list when clicking Voltar', () => {
            render(<PessoaFisicaPage />);

            fireEvent.click(screen.getByText('Voltar'));

            expect(mockRouter.push).toHaveBeenCalledWith('/proponentes');
        });
    });

    describe('Data Persistence', () => {
        it('should maintain form data when navigating between steps', () => {
            render(<PessoaFisicaPage />);

            // Fill data in first step
            const nameInput = screen.getByLabelText(/Nome completo/i) as HTMLInputElement;
            fireEvent.change(nameInput, { target: { value: 'João Silva' } });

            // Navigate forward
            fireEvent.click(screen.getByText('Próximo'));

            // Navigate back
            fireEvent.click(screen.getByText('Anterior'));

            // Data should still be there
            const nameInputAgain = screen.getByLabelText(/Nome completo/i) as HTMLInputElement;
            expect(nameInputAgain.value).toBe('João Silva');
        });
    });
});
