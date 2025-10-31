from flask import Flask, request, jsonify
from flask_cors import CORS
from scheduler import multilevel_queue, multilevel_feedback, hrrn, fair_share

app = Flask(__name__)
CORS(app)

@app.route('/schedule', methods=['POST'])
def schedule():
    data = request.get_json()
    raw_jobs = data['jobs']
    jobs = []

    for row in raw_jobs:
        jobs.append({
            'pid': row['pid'],
            'arrival': int(row['arrival']),
            'burst': int(row['burst']),
            'priority': int(row['priority']),
            'user': row['user']
        })

    results = {
        'Multilevel Queue': multilevel_queue.run(list(jobs)),
        'Multilevel Feedback Queue': multilevel_feedback.run(list(jobs)),
        'HRRN': hrrn.run(list(jobs)),
        'Fair Share Scheduling': fair_share.run(list(jobs))
    }

    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True)
