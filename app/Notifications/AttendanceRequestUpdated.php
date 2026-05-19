<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttendanceRequestUpdated extends Notification
{
    use Queueable;

    public $attendanceRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct($attendanceRequest)
    {
        $this->attendanceRequest = $attendanceRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Attendance Request Status Updated')
                    ->line('Your attendance request status has been updated.')
                    ->line('Type: ' . $this->attendanceRequest->request_type)
                    ->line('Status: ' . $this->attendanceRequest->status)
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->attendanceRequest->id,
            'status' => $this->attendanceRequest->status,
            'message' => 'Your attendance request was ' . $this->attendanceRequest->status,
        ];
    }
}
