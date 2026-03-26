<?php
/**
 * Plugin Name: SportMaster Product Calculator
 * Plugin URI:  https://sportmastersurfaces.com
 * Description: Court surfacing materials calculator. Use the [sportmaster_calculator] shortcode on any page.
 * Version:     1.2.0
 * Author:      SportMaster Sport Surfaces
 * License:     GPL-2.0-or-later
 * Text Domain: sportmaster-calculator
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue plugin assets only on pages that contain the shortcode.
 */
function sportmaster_calculator_enqueue() {
    global $post;
    if ( ! is_a( $post, 'WP_Post' ) ) {
        return;
    }
    if ( ! has_shortcode( $post->post_content, 'sportmaster_calculator' )
      && ! has_shortcode( $post->post_content, 'sportmaster-calculator' ) ) {
        return;
    }

    $plugin_url = plugin_dir_url( __FILE__ );

    wp_enqueue_style(
        'sportmaster-calculator',
        $plugin_url . 'assets/css/sportmaster-calculator.css',
        array(),
        '1.2.0'
    );

    wp_enqueue_script(
        'emailjs-sdk',
        'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
        array(),
        null,
        true
    );

    wp_enqueue_script(
        'sportmaster-territories',
        $plugin_url . 'assets/js/territories.js',
        array(),
        '1.0.0',
        true
    );

    wp_enqueue_script(
        'sportmaster-app',
        $plugin_url . 'assets/js/app.js',
        array( 'emailjs-sdk', 'sportmaster-territories' ),
        '1.2.0',
        true
    );

    wp_localize_script( 'sportmaster-app', 'sportmasterCalcData', array(
        'pluginUrl'  => $plugin_url,
        'assetsUrl'  => $plugin_url . 'assets/images/',
    ) );
}
add_action( 'wp_enqueue_scripts', 'sportmaster_calculator_enqueue' );

/**
 * Render the calculator via shortcode.
 */
function sportmaster_calculator_shortcode( $atts ) {
    ob_start();
    include plugin_dir_path( __FILE__ ) . 'includes/shortcode-output.php';
    return ob_get_clean();
}
add_shortcode( 'sportmaster_calculator', 'sportmaster_calculator_shortcode' );
add_shortcode( 'sportmaster-calculator', 'sportmaster_calculator_shortcode' );
