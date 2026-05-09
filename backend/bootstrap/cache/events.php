<?php return array (
  'App\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\AdBoosted' => 
    array (
      0 => 'App\\Listeners\\TrackBoostConversion',
      1 => 
      array (
        0 => 'App\\Listeners\\InvalidateAdCache',
        1 => 'handleAdBoosted',
      ),
    ),
    'App\\Events\\AdSaved' => 
    array (
      0 => 'App\\Listeners\\TrackAdSave',
      1 => 
      array (
        0 => 'App\\Listeners\\InvalidateAdCache',
        1 => 'handleAdSaved',
      ),
    ),
    'App\\Events\\AdShared' => 
    array (
      0 => 'App\\Listeners\\TrackAdShare',
    ),
    'App\\Events\\BoostExpired' => 
    array (
      0 => 
      array (
        0 => 'App\\Listeners\\InvalidateAdCache',
        1 => 'handleBoostExpired',
      ),
    ),
    'App\\Events\\BoostRenewed' => 
    array (
      0 => 
      array (
        0 => 'App\\Listeners\\InvalidateAdCache',
        1 => 'handleBoostRenewed',
      ),
    ),
  ),
  'Illuminate\\Foundation\\Support\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\AdSaved' => 
    array (
      0 => 'App\\Listeners\\InvalidateAdCache@handleAdSaved',
      1 => 'App\\Listeners\\TrackAdSave@handle',
    ),
    'App\\Events\\AdBoosted' => 
    array (
      0 => 'App\\Listeners\\InvalidateAdCache@handleAdBoosted',
      1 => 'App\\Listeners\\TrackBoostConversion@handle',
    ),
    'App\\Events\\BoostExpired' => 
    array (
      0 => 'App\\Listeners\\InvalidateAdCache@handleBoostExpired',
    ),
    'App\\Events\\BoostRenewed' => 
    array (
      0 => 'App\\Listeners\\InvalidateAdCache@handleBoostRenewed',
    ),
    'App\\Events\\AdShared' => 
    array (
      0 => 'App\\Listeners\\TrackAdShare@handle',
    ),
  ),
);