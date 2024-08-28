document.getElementById('form-quinquenios').addEventListener('submit', function(event) {
    event.preventDefault();

    const dataAdmissao = new Date(document.getElementById('data-admissao').value);
    const hoje = new Date();
    const diffAnos = hoje.getFullYear() - dataAdmissao.getFullYear();

    if (isNaN(diffAnos) || diffAnos < 0) {
        alert("Por favor, insira uma data de admissão válida.");
        return;
    }

    const quinquenios = Math.floor(diffAnos / 5);
    const resultado = `O funcionário tem direito a ${quinquenios} quinquênios.`;

    document.getElementById('resultado').innerText = resultado;
});



        let processedData = [];
        let chart = null;
        let totalFaltasInjustificadas = 0;

        document.addEventListener("DOMContentLoaded", function() {
            const endDateInput = document.getElementById("endDate");
            const today = new Date();
            endDateInput.value = formatDateInput(today);
        });

        function formatDateBrazilian(date) {
            return date.toLocaleDateString('pt-BR');
        }

        function formatDateInput(date) {
            return date.toISOString().split('T')[0];
        }

       document.getElementById('removeDots').addEventListener('click', function() {
    let textarea = document.getElementById('dataPaste');
    
    // Substituir os pontos que são usados como separadores de milhar
    textarea.value = textarea.value.replace(/\.(?=\d{3},\d{2})/g, '');
    
    // Substituir as vírgulas que são usadas como separadores decimais por pontos
    textarea.value = textarea.value.replace(/,(\d{2})/g, '.$1');
});


        document.getElementById('processData').addEventListener('click', function() {
            let rawData = document.getElementById('dataPaste').value;
            let output = document.getElementById('output');
            let faltasResult = document.getElementById('faltasResult');
            output.innerHTML = '';
            faltasResult.innerHTML = '';

            let lines = rawData.split('\n');
            processedData = [];

            for (let i = 1; i < lines.length; i++) {
                let columns = lines[i].split(/\s+/).filter(Boolean);
                if (columns.length >= 6) {
                    let ganhos = parseFloat(columns[3].replace(',', '.'));
                    let valor = parseFloat(columns[2].replace(',', '.'));
                    processedData.push({
                        referencia: columns[0],
                        codigo: parseInt(columns[1]),
                        valor: valor,
                        ganhos: ganhos,
                        desconto: parseFloat(columns[4].replace(',', '.')),
                        liquido: parseFloat(columns[5].replace(',', '.')),
                        faltasCalculadas: (ganhos > 0) ? (valor / (ganhos / 30)) : 0
                    });
                }
            }

            if (processedData.length > 0) {
                displayProcessedData();
                updateChart();
            } else {
                output.innerHTML = '<div class="alert alert-warning">Nenhum dado válido foi processado.</div>';
            }
        });

        document.getElementById('calculateFaltas').addEventListener('click', function() {
            let totalFaltas = 0;
            let totalValorFaltas = 0;
            let totalGanhos = 0;
            let totalDesconto = 0;
            let totalLiquido = 0;

            processedData.forEach(item => {
                totalFaltas += item.faltasCalculadas;
                totalValorFaltas += item.valor;
                totalGanhos += item.ganhos;
                totalDesconto += item.desconto;
                totalLiquido += item.liquido;
            });

            totalFaltasInjustificadas = Math.ceil(totalFaltas);

            let faltasResult = document.getElementById('faltasResult');
            faltasResult.innerHTML = `
                <h4>Resultado das Faltas</h4>
                <p>Total de faltas calculado: ${totalFaltas.toFixed(2)} dia(s)</p>
                <p>Atraso na concessão do quinquênio: ${totalFaltasInjustificadas} meses</p>
                <h5>Somatório:</h5>
                <p>Total Valor (Desconto): R$ ${totalValorFaltas.toFixed(2)}</p>
                <p>Total Ganhos: R$ ${totalGanhos.toFixed(2)}</p>
                <p>Total Desconto: R$ ${totalDesconto.toFixed(2)}</p>
                <p>Total Líquido: R$ ${totalLiquido.toFixed(2)}</p>
                <button id="addFaltasInterruption" class="btn btn-warning">Adicionar como Interrupção</button>
            `;

            document.getElementById('addFaltasInterruption').addEventListener('click', function() {
                addInterruption(totalFaltasInjustificadas);
            });
        });

        function displayProcessedData() {
            let output = document.getElementById('output');
            let tableHtml = `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Referência</th>
                                <th>Código</th>
                                <th>Valor (Desconto)</th>
                                <th>Ganhos</th>
                                <th>Desconto</th>
                                <th>Líquido</th>
                                <th>Faltas Calculadas</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            processedData.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${item.referencia}</td>
                        <td>${item.codigo}</td>
                        <td>R$ ${item.valor.toFixed(2)}</td>
                        <td>R$ ${item.ganhos.toFixed(2)}</td>
                        <td>R$ ${item.desconto.toFixed(2)}</td>
                        <td>R$ ${item.liquido.toFixed(2)}</td>
                        <td>${item.faltasCalculadas.toFixed(2)}</td>
                    </tr>
                `;
            });

            tableHtml += `
                        </tbody>
                    </table>
                </div>
            `;

            output.innerHTML = tableHtml;
        }

        function updateChart() {
            const ctx = document.getElementById('quinquenniumChart').getContext('2d');
            if (chart) {
                chart.destroy();
            }

            const labels = processedData.map(item => item.referencia);
            const faltas = processedData.map(item => item.faltasCalculadas);
            const ganhos = processedData.map(item => item.ganhos);

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Faltas Calculadas',
                        data: faltas,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Ganhos',
                        data: ganhos,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        document.getElementById('clearData').addEventListener('click', function() {
            document.getElementById('dataPaste').value = '';
            document.getElementById('output').innerHTML = '';
            document.getElementById('faltasResult').innerHTML = '';
            processedData = [];
            if (chart) {
                chart.destroy();
            }
        });

        let interruptionCount = 0;

        function addInterruption(months = 0) {
            interruptionCount++;
            const interruptionsDiv = document.getElementById('interruptions');
            const newInterruption = document.createElement('div');
            newInterruption.classList.add('row', 'mb-3');
            newInterruption.innerHTML = `
                <div class="col-md-5">
                    <input type="date" class="form-control interruption-start" required>
                </div>
                <div class="col-md-5">
                    <input type="date" class="form-control interruption-end" required>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger remove-interruption">Remover</button>
                </div>
            `;
            interruptionsDiv.appendChild(newInterruption);

            if (months > 0) {
                const startDate = new Date(document.getElementById('startDate').value);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + months);

                newInterruption.querySelector('.interruption-start').value = formatDateInput(startDate);
                newInterruption.querySelector('.interruption-end').value = formatDateInput(endDate);
            }

            newInterruption.querySelector('.remove-interruption').addEventListener('click', function() {
                interruptionsDiv.removeChild(newInterruption);
            });
        }

        document.getElementById('addInterruption').addEventListener('click', function() {
            addInterruption();
        });

        document.getElementById('quinquenniumForm').addEventListener('submit', function(e) {
            e.preventDefault();
            calculateQuinquennium();
        });

       function calculateQuinquennium() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    let interruptions = [];

    document.querySelectorAll('.interruption-start').forEach((el, index) => {
        const interruptionStart = new Date(el.value);
        const interruptionEnd = new Date(document.querySelectorAll('.interruption-end')[index].value);

        if (interruptionStart > interruptionEnd) {
            alert('Data de início da interrupção deve ser anterior à data de término.');
            return;
        }
        
        interruptions.push({
            start: interruptionStart,
            end: interruptionEnd
        });
    });

            let quinquenniums = [];
            let currentStart = new Date(startDate);
            let adjustedEndDate = new Date(endDate);

            while (currentStart < adjustedEndDate) {
                let quinquenniumEnd = new Date(currentStart);
                quinquenniumEnd.setFullYear(quinquenniumEnd.getFullYear() + 5);

                let totalInterruptionDays = 0;
                interruptions.forEach(interruption => {
                    if (interruption.start < quinquenniumEnd && interruption.end > currentStart) {
                        let interruptionStart = new Date(Math.max(currentStart, interruption.start));
                        let interruptionEnd = new Date(Math.min(quinquenniumEnd, interruption.end));
                        totalInterruptionDays += (interruptionEnd - interruptionStart) / (1000 * 60 * 60 * 24);
                    }
                });
                quinquenniumEnd.setDate(quinquenniumEnd.getDate() + totalInterruptionDays);

                if (quinquenniumEnd > adjustedEndDate) {
                    quinquenniumEnd = new Date(adjustedEndDate);
                }

                quinquenniums.push({
                    start: new Date(currentStart),
                    end: new Date(quinquenniumEnd)
                });

                currentStart = new Date(quinquenniumEnd);
            }

            displayQuinquenniums(quinquenniums);
        }

        function displayQuinquenniums(quinquenniums) {
            const table = document.getElementById('quinquenniumTable');
            table.innerHTML = '';
            quinquenniums.forEach((q, index) => {
                const row = table.insertRow();
                row.insertCell(0).textContent = index + 1;
                row.insertCell(1).textContent = formatDateBrazilian(q.start);
                row.insertCell(2).textContent = formatDateBrazilian(q.end);
            });

            updateQuinquenniumChanges(quinquenniums);
        }

        function updateQuinquenniumChanges(quinquenniums) {
            const changesDiv = document.getElementById('quinquenniumChanges');
            changesDiv.innerHTML = '<h4>Alterações nos Quinquênios</h4>';
            
            quinquenniums.forEach((q, index) => {
                const originalEnd = new Date(q.start);
                originalEnd.setFullYear(originalEnd.getFullYear() + 5);
                
                if (q.end > originalEnd) {
                    const difference = Math.round((q.end - originalEnd) / (1000 * 60 * 60 * 24));
                    changesDiv.innerHTML += `<p>Quinquênio ${index + 1}: Adiado em ${difference} dias.</p>`;
                }
            });
        }

        function gerarParecer() {
            const parecerOutput = document.getElementById('parecerOutput');
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            const serverName = document.getElementById('serverName').value;
            const serverMatricula = document.getElementById('serverMatricula').value;
            const parecerNumber = document.getElementById('parecerNumber').value;
            const parecerYear = document.getElementById('parecerYear').value;
            const assessorName = document.getElementById('assessorName').value;
            
            let parecer = `PARECER N.º ${parecerNumber}/${parecerYear} - ASJUR/SEDUC\n\n`;
            parecer += `EMENTA: ADMINISTRATIVO. SERVIDOR PÚBLICO. QUINQUÊNIO. CONCESSÃO. LEGALIDADE.\n\n`;
            parecer += `I - RELATÓRIO\n\n`;
            parecer += `Trata-se de processo administrativo que versa sobre o pedido de concessão de quinquênio formulado pelo(a) servidor(a) ${serverName}, matrícula nº ${serverMatricula}.\n\n`;
            parecer += `O servidor ingressou no serviço público estadual em ${formatDateBrazilian(startDate)}, conforme comprovado pela Portaria de Nomeação anexa aos autos.\n\n`;
            parecer += `II - FUNDAMENTAÇÃO\n\n`;
            parecer += `A concessão de quinquênios aos servidores públicos estaduais está prevista no art. 78 da Lei nº 1.762, de 14 de novembro de 1986 (Estatuto dos Funcionários Públicos Civis do Estado do Amazonas), que assim dispõe:\n\n`;
            parecer += `"Art. 78 - A cada cinco anos de efetivo exercício, o funcionário fará jus à percepção de um adicional por tempo de serviço, calculado à razão de 5% (cinco por cento) sobre o vencimento básico do cargo efetivo, salvo as exceções legais."\n\n`;
            parecer += `Conforme se depreende dos autos, o servidor cumpriu os requisitos legais para a concessão do benefício, tendo completado o período aquisitivo necessário para a concessão do(s) quinquênio(s) pleiteado(s).\n\n`;
            parecer += `III - CONCLUSÃO\n\n`;
            parecer += `Ante o exposto, esta Assessoria Jurídica opina pela CONCESSÃO do(s) quinquênio(s) ao(à) servidor(a) ${serverName}, nos termos do art. 78 da Lei nº 1.762/1986, observando-se as datas de início de cada período aquisitivo, conforme demonstrativo anexo.\n\n`;
            parecer += `É o parecer, salvo melhor juízo.\n\n`;
            parecer += `Manaus, ${formatDateBrazilian(new Date())}.\n\n`;
            parecer += `${assessorName}\n`;
            parecer += `Assessor Jurídico - SEDUC/AM`;

            parecerOutput.textContent = parecer;
        }

        function baixarPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const parecer = document.getElementById('parecerOutput').textContent;
            const lines = doc.splitTextToSize(parecer, 180);
            doc.text(lines, 15, 15);
            doc.save('parecer_quinquenio.pdf');
        }

        function gerarRespostaDeferida() {
            const respostaOutput = document.getElementById('respostaOutput');
            const startDate = new Date(document.getElementById('startDate').value);
            const serverName = document.getElementById('serverName').value;
            
            let resposta = `Prezado(a) Servidor(a) ${serverName},\n\n`;
            resposta += `Em resposta à sua solicitação de concessão de quinquênio, informamos que seu pedido foi DEFERIDO.\n\n`;
            resposta += `Conforme análise realizada, verificou-se que Vossa Senhoria cumpriu os requisitos legais previstos no art. 78 da Lei nº 1.762, de 14 de novembro de 1986 (Estatuto dos Funcionários Públicos Civis do Estado do Amazonas).\n\n`;
            resposta += `Seu ingresso no serviço público estadual ocorreu em ${formatDateBrazilian(startDate)}, e desde então, completou o(s) período(s) aquisitivo(s) necessário(s) para a concessão do(s) quinquênio(s).\n\n`;
            resposta += `O(s) quinquênio(s) será(ão) incorporado(s) à sua remuneração conforme demonstrativo anexo, observando-se as datas de início de cada período aquisitivo.\n\n`;
            resposta += `Caso tenha alguma dúvida ou necessite de esclarecimentos adicionais, por favor, entre em contato com o setor de Recursos Humanos.\n\n`;
            resposta += `Atenciosamente,\n\n`;
            resposta += `Secretaria de Estado de Educação e Desporto do Amazonas - SEDUC/AM`;

            respostaOutput.textContent = resposta;
        }

        function gerarRespostaIndeferida() {
            const respostaOutput = document.getElementById('respostaOutput');
            const serverName = document.getElementById('serverName').value;
            
            let resposta = `Prezado(a) Servidor(a) ${serverName},\n\n`;
            resposta += `Em resposta à sua solicitação de concessão de quinquênio, lamentamos informar que seu pedido foi INDEFERIDO.\n\n`;
            resposta += `Após análise criteriosa da documentação apresentada e do seu histórico funcional, constatou-se que não foram atendidos todos os requisitos legais previstos no art. 78 da Lei nº 1.762, de 14 de novembro de 1986 (Estatuto dos Funcionários Públicos Civis do Estado do Amazonas).\n\n`;
            resposta += `Os motivos específicos que levaram ao indeferimento são:\n\n`;
            resposta += `[Listar aqui os motivos específicos do indeferimento]\n\n`;
            resposta += `Caso discorde desta decisão ou possua informações adicionais que possam alterar este entendimento, você tem o direito de apresentar um recurso no prazo de [inserir prazo] dias úteis a partir do recebimento desta notificação.\n\n`;
            resposta += `Para mais informações sobre o processo de recurso ou esclarecimentos adicionais, entre em contato com o setor de Recursos Humanos.\n\n`;
            resposta += `Atencios

amente,\n\n`;
            resposta += `Secretaria de Estado de Educação e Desporto do Amazonas - SEDUC/AM`;

            respostaOutput.textContent = resposta;
        }
    



function calcularQuinquenios() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        const faltasInjustificadas = totalFaltasInjustificadas || 0;

        let quinquenios = [];
        let currentDate = new Date(startDate);
        let quinquenioStart = new Date(startDate);
        let quinquenioCount = 0;

        // Obter interrupções
        let interruptions = [];
        document.querySelectorAll('.interruption-start').forEach((el, index) => {
            interruptions.push({
                start: new Date(el.value),
                end: new Date(document.querySelectorAll('.interruption-end')[index].value)
            });
        });

        while (currentDate <= endDate) {
            // Calcular o fim do quinquênio atual
            let quinquenioEnd = new Date(quinquenioStart);
            quinquenioEnd.setFullYear(quinquenioEnd.getFullYear() + 5);

            // Adicionar atraso devido a faltas injustificadas
            if (faltasInjustificadas > 0) {
                quinquenioEnd.setMonth(quinquenioEnd.getMonth() + faltasInjustificadas);
            }

            // Verificar interrupções
            let totalInterruptionDays = 0;
            interruptions.forEach(interruption => {
                if (interruption.start < quinquenioEnd && interruption.end > quinquenioStart) {
                    let interruptionStart = new Date(Math.max(quinquenioStart, interruption.start));
                    let interruptionEnd = new Date(Math.min(quinquenioEnd, interruption.end));
                    totalInterruptionDays += (interruptionEnd - interruptionStart) / (1000 * 60 * 60 * 24);
                }
            });
            quinquenioEnd.setDate(quinquenioEnd.getDate() + totalInterruptionDays);

            // Verificar se o quinquênio foi concluído
            if (currentDate >= quinquenioEnd) {
                quinquenioCount++;
                quinquenios.push({
                    numero: quinquenioCount,
                    inicio: new Date(quinquenioStart),
                    fim: new Date(quinquenioEnd)
                });

                // Iniciar novo quinquênio
                quinquenioStart = new Date(quinquenioEnd);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Adicionar quinquênio em andamento, se houver
        if (quinquenioStart < endDate) {
            quinquenios.push({
                numero: quinquenioCount + 1,
                inicio: new Date(quinquenioStart),
                fim: null,
                emAndamento: true
            });
        }

        return quinquenios;
    }

    function exibirResultados() {
        const faltasCalculo = document.getElementById('faltasCalculo');
        const quinqueniosCalculo = document.getElementById('quinqueniosCalculo');

        faltasCalculo.innerHTML = `
            <p>Total de faltas injustificadas: ${totalFaltasInjustificadas}</p>
            <p>Atraso na concessão do quinquênio: ${totalFaltasInjustificadas} meses</p>
        `;

        const quinquenios = calcularQuinquenios();
        let quinqueniosHTML = '<h5>Quinquênios Calculados:</h5><ul>';

        quinquenios.forEach(q => {
            if (q.emAndamento) {
                quinqueniosHTML += `<li>Quinquênio ${q.numero} (em andamento): Início em ${q.inicio.toLocaleDateString('pt-BR')}</li>`;
            } else {
                quinqueniosHTML += `<li>Quinquênio ${q.numero}: ${q.inicio.toLocaleDateString('pt-BR')} a ${q.fim.toLocaleDateString('pt-BR')}</li>`;
            }
        });

        quinqueniosHTML += '</ul>';
        quinqueniosCalculo.innerHTML = quinqueniosHTML;

        // Adicionar detalhes das interrupções
        let interruptionsHTML = '<h5>Detalhes das Interrupções:</h5><ul>';
        document.querySelectorAll('.interruption-start').forEach((el, index) => {
            const start = new Date(el.value);
            const end = new Date(document.querySelectorAll('.interruption-end')[index].value);
            const days = (end - start) / (1000 * 60 * 60 * 24);
            interruptionsHTML += `<li>Interrupção ${index + 1}: ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')} (${days} dias)</li>`;
        });
        interruptionsHTML += '</ul>';
        quinqueniosCalculo.innerHTML += interruptionsHTML;
    }

    // Chamar a função de cálculo quando o formulário for submetido
    document.getElementById('quinquenniumForm').addEventListener('submit', function(e) {
        e.preventDefault();
        exibirResultados();
    });

    // Atualizar cálculos quando as faltas forem calculadas
    document.getElementById('calculateFaltas').addEventListener('click', function() {
        setTimeout(exibirResultados, 100); // Pequeno atraso para garantir que totalFaltasInjustificadas foi atualizado
    });
