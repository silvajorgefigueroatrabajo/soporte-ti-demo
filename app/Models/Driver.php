<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'center_code', 'center_name', 'name', 'pos_serial', 'chip_type',
        'sap_code', 'rut', 'username', 'email', 'company', 'email_password', 'btp_user',
        'observations', 'request_date', 'go_live',
    ];

    protected $hidden = ['email_password'];

    protected function casts(): array
    {
        return ['email_password' => 'encrypted'];
    }
}
