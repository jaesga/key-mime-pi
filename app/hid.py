import time
import logging

logger = logging.getLogger(__name__)

def send(hid_path, control_keys, hid_keycode):
    logger.info("Key Stroke")
    with open(hid_path, 'wb+') as hid_handle:
        buf = [0] * 8
        buf[0] = control_keys
        buf[2] = hid_keycode
        hid_handle.write(bytearray(buf))
        hid_handle.write(bytearray([0] * 8))



def send_long(hid_path, control_keys, hid_keycode):
    logger.info("Long Key Stroke")
    with open(hid_path, 'wb+') as hid_handle:
        buf = [0] * 8
        buf[0] = control_keys
        buf[2] = hid_keycode
        hid_handle.write(bytearray(buf))
        logger.info("Key E")
        time.sleep(0.8)
        logger.info("Key E release")
        hid_handle.write(bytearray([0] * 8))