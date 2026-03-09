"""
Customer.io API client for campaign and engagement data.

Supports listing campaigns, fetching metrics, counting segment populations,
and sending behavioural events back to Customer.io.
"""

import logging
import time
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

_DEFAULT_TIMEOUT = 30  # seconds


class CustomerIOClient:
    """
    Thin wrapper around the Customer.io App API (v1) and Track API.

    The App API is used for read operations (campaigns, metrics, segments).
    The Track API is used for write operations (sending events).

    Args:
        api_key: Customer.io App API key (Bearer token).
        site_id: Customer.io site ID (used for Track API basic-auth username).
        track_api_key: Customer.io Track API key (basic-auth password).
        region: "us" (default) or "eu".
    """

    _APP_URLS = {
        "us": "https://api.customer.io/v1",
        "eu": "https://api-eu.customer.io/v1",
    }
    _TRACK_URLS = {
        "us": "https://track.customer.io/api/v1",
        "eu": "https://track-eu.customer.io/api/v1",
    }

    def __init__(
        self,
        api_key: str,
        site_id: str,
        track_api_key: str = "",
        region: str = "us",
    ) -> None:
        self.api_key = api_key
        self.site_id = site_id
        self.track_api_key = track_api_key
        self.region = region
        self.app_base_url = self._APP_URLS.get(region, self._APP_URLS["us"])
        self.track_base_url = self._TRACK_URLS.get(region, self._TRACK_URLS["us"])
        self._session = self._build_session()

    # ------------------------------------------------------------------
    # Session setup
    # ------------------------------------------------------------------

    def _build_session(self) -> requests.Session:
        session = requests.Session()
        session.headers.update(
            {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )
        return session

    def _app_get(self, path: str, params: Optional[Dict] = None) -> Dict:
        """Perform a GET request against the App API."""
        url = f"{self.app_base_url}{path}"
        try:
            resp = self._session.get(url, params=params, timeout=_DEFAULT_TIMEOUT)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as exc:
            logger.error("Customer.io App API error %s: %s", exc.response.status_code, exc)
            raise
        except requests.exceptions.RequestException as exc:
            logger.error("Customer.io App API request failed: %s", exc)
            raise

    def _track_post(self, path: str, payload: Dict) -> bool:
        """Perform a POST request against the Track API."""
        url = f"{self.track_base_url}{path}"
        try:
            resp = requests.post(
                url,
                json=payload,
                auth=(self.site_id, self.track_api_key),
                timeout=_DEFAULT_TIMEOUT,
            )
            resp.raise_for_status()
            return True
        except requests.exceptions.HTTPError as exc:
            logger.error(
                "Customer.io Track API error %s: %s",
                exc.response.status_code,
                exc,
            )
            return False
        except requests.exceptions.RequestException as exc:
            logger.error("Customer.io Track API request failed: %s", exc)
            return False

    # ------------------------------------------------------------------
    # Campaigns
    # ------------------------------------------------------------------

    def get_campaigns(self) -> List[Dict[str, Any]]:
        """
        List all campaigns in the account.

        Returns:
            List of campaign dicts with id, name, status, type.
        """
        data = self._app_get("/campaigns")
        campaigns = data.get("campaigns", [])
        logger.info("Retrieved %d campaigns", len(campaigns))
        return campaigns

    def get_campaign_metrics(self, campaign_id: int) -> Dict[str, Any]:
        """
        Fetch engagement metrics for a single campaign.

        Args:
            campaign_id: Numeric Customer.io campaign ID.

        Returns:
            Dict containing open_rate, click_rate, unsubscribe_rate, conversions, etc.
        """
        data = self._app_get(f"/campaigns/{campaign_id}/metrics")
        metrics = data.get("metric", data)  # shape varies by API version

        # Normalise to a flat dict with clear field names
        normalised = {
            "campaign_id": campaign_id,
            "sent": metrics.get("sent", 0),
            "delivered": metrics.get("delivered", 0),
            "opened": metrics.get("opened", 0),
            "clicked": metrics.get("clicked", 0),
            "converted": metrics.get("converted", 0),
            "unsubscribed": metrics.get("unsubscribed", 0),
            "bounced": metrics.get("bounced", 0),
            "open_rate": self._safe_rate(metrics.get("opened", 0), metrics.get("delivered", 0)),
            "click_rate": self._safe_rate(metrics.get("clicked", 0), metrics.get("delivered", 0)),
            "conversion_rate": self._safe_rate(
                metrics.get("converted", 0), metrics.get("delivered", 0)
            ),
            "unsubscribe_rate": self._safe_rate(
                metrics.get("unsubscribed", 0), metrics.get("delivered", 0)
            ),
            "bounce_rate": self._safe_rate(metrics.get("bounced", 0), metrics.get("sent", 0)),
        }
        logger.debug("Metrics for campaign %d: %s", campaign_id, normalised)
        return normalised

    def get_all_campaign_metrics(self) -> List[Dict[str, Any]]:
        """
        Fetch metrics for every campaign in the account.

        Returns:
            List of metric dicts (one per campaign).
        """
        campaigns = self.get_campaigns()
        results = []
        for camp in campaigns:
            cid = camp.get("id")
            if cid:
                try:
                    metrics = self.get_campaign_metrics(cid)
                    metrics["campaign_name"] = camp.get("name", "")
                    metrics["campaign_type"] = camp.get("type", "")
                    results.append(metrics)
                except Exception as exc:
                    logger.warning("Could not fetch metrics for campaign %s: %s", cid, exc)
                time.sleep(0.1)  # respect rate limits
        return results

    # ------------------------------------------------------------------
    # Segments
    # ------------------------------------------------------------------

    def get_segments(self) -> List[Dict[str, Any]]:
        """
        List all segments in the account.

        Returns:
            List of segment dicts with id, name, type, and count.
        """
        data = self._app_get("/segments")
        segments = data.get("segments", [])
        logger.info("Retrieved %d segments", len(segments))
        return segments

    def get_segment_counts(self) -> Dict[str, int]:
        """
        Return a mapping of segment name → customer count.

        Returns:
            Dict {segment_name: count}.
        """
        segments = self.get_segments()
        return {seg.get("name", str(seg.get("id"))): seg.get("count", 0) for seg in segments}

    # ------------------------------------------------------------------
    # Event tracking
    # ------------------------------------------------------------------

    def send_event(
        self,
        customer_id: str,
        event_name: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send a named event for a customer to Customer.io.

        Args:
            customer_id: Customer identifier (maps to the `id` attribute).
            event_name: Event name (e.g. "clv_segment_updated").
            data: Optional payload dict attached to the event.

        Returns:
            True if the event was accepted, False otherwise.
        """
        payload: Dict[str, Any] = {"name": event_name, "data": data or {}}
        path = f"/customers/{customer_id}/events"
        success = self._track_post(path, payload)
        if success:
            logger.debug("Event '%s' sent for customer %s", event_name, customer_id)
        return success

    def identify_customer(
        self,
        customer_id: str,
        attributes: Dict[str, Any],
    ) -> bool:
        """
        Create or update a customer profile in Customer.io.

        Args:
            customer_id: Customer identifier.
            attributes: Dict of customer attributes to set/update.

        Returns:
            True if the request succeeded.
        """
        path = f"/customers/{customer_id}"
        try:
            url = f"{self.track_base_url}{path}"
            resp = requests.put(
                url,
                json=attributes,
                auth=(self.site_id, self.track_api_key),
                timeout=_DEFAULT_TIMEOUT,
            )
            resp.raise_for_status()
            return True
        except requests.exceptions.RequestException as exc:
            logger.error("Failed to identify customer %s: %s", customer_id, exc)
            return False

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _safe_rate(numerator: float, denominator: float) -> float:
        """Return numerator / denominator as a percentage, or 0.0 if denominator is 0."""
        if not denominator:
            return 0.0
        return round((numerator / denominator) * 100, 2)
