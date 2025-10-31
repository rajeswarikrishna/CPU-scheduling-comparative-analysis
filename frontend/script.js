document.getElementById('compare-btn').addEventListener('click', function() {
    if (window.lastScheduleData) {
        displayLineGraph(window.lastScheduleData);
        displayComparison(window.lastScheduleData);
    suggestBest(window.lastScheduleData);
    } else {
        alert('Please run the schedulers first!');
    }
  });
  
 
  document.getElementById('job-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('compare-btn').style.display = 'block'; 
  
    const tableBody = document.getElementById('job-table-body');
    const rows = tableBody.querySelectorAll('tr');
    let jobs = [];
  
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        let job = {
            pid: inputs[0].value.trim(),
            arrival: parseInt(inputs[1].value),
            burst: parseInt(inputs[2].value),
            priority: parseInt(inputs[3].value),
            user: inputs[4].value.trim()
        };
        jobs.push(job);
    });
  
    console.log('Jobs:', jobs);
  
    const response = await fetch('https://cpu-scheduler-backend-s012.onrender.com/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: jobs })
    });
  
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        alert('Something went wrong on server side!');
        return;
    }
  
    const data = await response.json();
    window.lastScheduleData = data; 
  
    displayGanttCharts(data);
    
  });

  function displayGanttCharts(data) {
    const container = document.getElementById('gantt-charts');
    container.innerHTML = '';
  
    for (const [algorithm, result] of Object.entries(data.results)) {
        const div = document.createElement('div');
        div.classList.add('fade-in');
        div.innerHTML = `<h3>${algorithm}</h3>
                         <div id="${algorithm}-timeline" class="gantt-timeline"></div>
                         <div id="${algorithm}-times" class="gantt-times"></div>`;
        container.appendChild(div);
  
        const timelineContainer = document.getElementById(`${algorithm}-timeline`);
        const timesContainer = document.getElementById(`${algorithm}-times`);
  
        let currentTime = 0;
  
        result.jobs.forEach((job, index) => {
            const jobBlock = document.createElement('div');
            jobBlock.classList.add('gantt-job', 'fade-in');
            jobBlock.style.width = `${job.burst * 10}px`;
            const color = randomColor();
            jobBlock.style.backgroundColor = color;
  
            const jobLabel = document.createElement('div');
            jobLabel.classList.add('gantt-label');
            jobLabel.innerHTML = `${job.pid}`;
            jobBlock.appendChild(jobLabel);
  
            timelineContainer.appendChild(jobBlock);

            const timeLabel = document.createElement('div');
            timeLabel.classList.add('time-point');
            timeLabel.style.width = `${job.burst * 10}px`;
            timeLabel.innerHTML = currentTime;
            timesContainer.appendChild(timeLabel);
  
            currentTime += job.burst;
  

            if (index === result.jobs.length - 1) {
                const finalTime = document.createElement('div');
                finalTime.classList.add('time-point');
                finalTime.innerHTML = currentTime;
                timesContainer.appendChild(finalTime);
            }
        });
    }
  }
 
  function randomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;
  }
  
 
  function displayComparison(data) {
    const container = document.getElementById('comparison');
    container.innerHTML = `<div class="fade-in">
    <h3>Algorithm Comparison</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Algorithm</th>
        <th>Avg Waiting Time</th>
        <th>Avg Turnaround Time</th>
        <th>Throughput (jobs/unit time)</th>
        <th>CPU Utilization (%)</th>
      </tr>
      ${Object.entries(data.results).map(([algo, res]) => `
        <tr>
          <td>${algo}</td>
          <td>${res.avg_waiting}</td>
          <td>${res.avg_turnaround}</td>
          <td>${res.throughput}</td>
          <td>${res.cpu_utilization}</td>
        </tr>`).join('')}
    </table>
    </div>`;
  }
  

  function displayLineGraph(data) {
    const labels = [];
    const avgWaitingTimes = [];
    const avgTurnaroundTimes = [];
    const throughput=[];
    const cpu_utilization=[];
  
    for (const [algo, res] of Object.entries(data.results)) {
        labels.push(algo);
        avgWaitingTimes.push(res.avg_waiting);
        avgTurnaroundTimes.push(res.avg_turnaround);
        throughput.push(res.throughput);
        cpu_utilization.push(res.cpu_utilization);

    }
  
    const ctx = document.getElementById('line-graph').getContext('2d');
  

    if (window.lineChartInstance) {
        window.lineChartInstance.destroy();
    }
  
    window.lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Waiting Time',
                    data: avgWaitingTimes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'Avg Turnaround Time',
                    data: avgTurnaroundTimes,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: false,
                    tension: 0.3
                },
                {
                  label: 'ThroughPut',
                  data: throughput,
                  borderColor: 'rgb(148, 34, 70)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: false,
                  tension: 0.3
              },
              {
                  label: 'CPU Utilization',
                  data: cpu_utilization,
                  borderColor: 'rgb(221, 102, 17)',
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
                  fill: false,
                  tension: 0.3
              },
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparison of All Metrics Across Algorithms'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Algorithms'
                    }
                }
            }
        }
    });
  }
  
  function suggestBest(data) {
    let bestAlgos = [];
    let minWaitingTime = Infinity;

    for (const [algo, res] of Object.entries(data.results)) {
        if (res.avg_waiting < minWaitingTime) {
            minWaitingTime = res.avg_waiting;
            bestAlgos = [algo]; 
        } else if (res.avg_waiting === minWaitingTime) {
            bestAlgos.push(algo); 
        }
    }

    const suggestionContainer = document.getElementById('suggestion');
    suggestionContainer.innerHTML = `<div class="fade-in">
    <h3>Suggested Algorithms</h3>
    <p><strong>${bestAlgos.join(', ')}</strong> perform best for this scenario with a minimum average waiting time of ${minWaitingTime} units.</p>`;

    bestAlgos.forEach(bestAlgo => {
        if (bestAlgo === 'HRRN') {
            suggestionContainer.innerHTML += `
            <h4>Advantages of HRRN (Highest Response Ratio Next)</h4>
            <ul>
              <li><strong>Dynamic Scheduling:</strong> HRRN adapts to the runtime characteristics of each process by adjusting its priority dynamically based on response ratio.</li>
              <li><strong>Minimizes Starvation:</strong> Processes that arrive late are not indefinitely delayed, unlike algorithms such as SJF.</li>
              <li><strong>Improved Turnaround Time:</strong> By considering both the burst time and waiting time, HRRN tends to give better turnaround times for a wide variety of workloads.</li>
            </ul>`;
        }

        if (bestAlgo === 'Fair Share Scheduling') {
            suggestionContainer.innerHTML += `
            <h4>Advantages of Fair Share Scheduling</h4>
            <ul>
              <li><strong>Equal Resource Allocation:</strong> Fair Share ensures that resources are distributed fairly among users or processes, preventing resource monopolization.</li>
              <li><strong>Prevents Starvation:</strong> By ensuring that each user or process receives a fair share, starvation of lower-priority processes is avoided.</li>
              <li><strong>Improved User Satisfaction:</strong> Each user gets a fair proportion of CPU time, which is ideal for multi-user systems.</li>
            </ul>`;
        }

        if (bestAlgo === 'Multilevel Queue') {
            suggestionContainer.innerHTML += `
            <h4>Advantages of Multilevel Queue Scheduling</h4>
            <ul>
              <li><strong>Efficient Handling of Processes:</strong> Multilevel Queue Scheduling effectively categorizes processes into different queues based on priority or other criteria, which makes process management more efficient.</li>
              <li><strong>Ideal for Mixed Workloads:</strong> It is ideal for systems with mixed workloads (interactive vs. batch), as each type of workload can have its own scheduling policies.</li>
              <li><strong>Low Latency for Interactive Tasks:</strong> Processes in the high-priority queue (typically interactive tasks) get scheduled more frequently, minimizing their waiting time.</li>
            </ul>`;
        }

        if (bestAlgo === 'Multilevel Feedback Queue') {
            suggestionContainer.innerHTML += `
            <h4>Advantages of Multilevel Feedback Queue Scheduling</h4>
            <ul>
              <li><strong>Dynamic Adjustment:</strong> Multilevel Feedback Queue allows processes to move between queues based on their behavior (e.g., burst time), which optimizes the process's execution.</li>
              <li><strong>Balanced Turnaround Time:</strong> It effectively balances the needs of both short and long tasks, improving system throughput while minimizing turnaround time.</li>
              <li><strong>Prevents Starvation:</strong> Like Fair Share, this scheduling prevents starvation, as processes can move to higher-priority queues if they wait too long in a lower-priority queue.</li>
            </ul>`;
        }
    });

    suggestionContainer.innerHTML += `</div>`;
}
